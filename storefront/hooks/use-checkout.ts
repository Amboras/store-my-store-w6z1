'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMedusaClient } from '@/lib/medusa-client'
import { logger } from '@/lib/logger'
import { useCart } from './use-cart'
import { useStripeConfig } from './use-stripe-config'

export type CheckoutStep = 'shipping' | 'payment'

export interface ShippingAddress {
  first_name: string
  last_name: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  postal_code: string
  country_code: string
  province?: string
  phone?: string
}

export interface PaymentSession {
  client_secret: string
  stripe_account_id: string
}

export function useCheckout() {
  const { cart } = useCart()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<CheckoutStep>('shipping')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null)
  const [isCompletingCheckout, setIsCompletingCheckout] = useState(false)

  const stripeConfig = useStripeConfig()

  // Fetch shipping options immediately — only needs cart_id (region-based)
  const { data: shippingOptions, isLoading: loadingShipping } = useQuery({
    queryKey: ['shipping-options', cart?.id],
    queryFn: async () => {
      if (!cart?.id) return []
      const { shipping_options } = await getMedusaClient().store.fulfillment.listCartOptions({
        cart_id: cart.id,
      })
      return shipping_options || []
    },
    enabled: !!cart?.id,
  })

  // Save address + set shipping method, then move to payment
  const submitShippingStep = async (email: string, address: ShippingAddress, shippingOptionId: string) => {
    if (!cart?.id) return
    setIsUpdating(true)
    setError(null)

    try {
      // Save address first (required before adding shipping method)
      await getMedusaClient().store.cart.update(cart.id, {
        email,
        shipping_address: address,
        billing_address: address,
      })

      // Set shipping method — only update cart cache once, after final call
      const { cart: finalCart } = await getMedusaClient().store.cart.addShippingMethod(cart.id, {
        option_id: shippingOptionId,
      })
      queryClient.setQueryData(['cart'], finalCart)

      setStep('payment')
    } catch (err: any) {
      setError(err?.message || 'Failed to save shipping details')
    } finally {
      setIsUpdating(false)
    }
  }

  // Initialize payment session when entering payment step
  const initializePayment = async () => {
    if (!cart?.id) return
    setIsUpdating(true)
    setError(null)

    try {
      const useStripe = stripeConfig.paymentReady
      const providerId = useStripe
        ? 'pp_stripe-connect_stripe-connect'
        : 'pp_system_default'

      const response = await getMedusaClient().store.payment.initiatePaymentSession(cart, {
        provider_id: providerId,
      })

      const sessions = (response as any)?.payment_collection?.payment_sessions
      const session = sessions?.find?.((s: any) => s.provider_id === providerId)

      if (useStripe && session?.data?.client_secret) {
        setPaymentSession({
          client_secret: session.data.client_secret,
          stripe_account_id: session.data.stripe_account_id || stripeConfig.stripeAccountId || '',
        })
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize payment')
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    if (step === 'payment' && cart?.id && !paymentSession) {
      initializePayment()
    }
  }, [step, cart?.id])

  const completeCheckout = async () => {
    if (!cart?.id) return null

    // Prevent duplicate requests
    if (isCompletingCheckout) {
      logger.debug('Checkout already in progress, skipping duplicate request')
      return null
    }

    setIsCompletingCheckout(true)
    setIsUpdating(true)
    setError(null)

    try {
      if (!stripeConfig.paymentReady) {
        await getMedusaClient().store.payment.initiatePaymentSession(cart, {
          provider_id: 'pp_system_default',
        })
      }

      const result = await getMedusaClient().store.cart.complete(cart.id)

      if (result?.type === 'order') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('medusa_cart_id')
        }
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        return result.order
      } else {
        setError('Payment is still pending. Please try again.')
        return null
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to place order'

      // Handle idempotency conflict OR already completed cart - order was already created
      if (errorMessage.includes('conflicted with another request') ||
          errorMessage.includes('Idempotency') ||
          errorMessage.includes('already completed')) {
        logger.debug('Cart already completed detected - order was created previously')

        // Try to fetch the completed cart/order
        try {
          const cartData = await getMedusaClient().store.cart.retrieve(cart.id)
          if (cartData?.cart?.completed_at) {
            // Cart was completed, clear it and treat as success
            if (typeof window !== 'undefined') {
              localStorage.removeItem('medusa_cart_id')
            }
            queryClient.invalidateQueries({ queryKey: ['cart'] })

            // Return a minimal order object with the cart ID so redirect happens
            return { id: cart.id } as any
          }
        } catch (retrieveErr) {
          console.error('Failed to retrieve cart:', retrieveErr)
          // If we can't retrieve it, just clear localStorage and show error
          if (typeof window !== 'undefined') {
            localStorage.removeItem('medusa_cart_id')
          }
          queryClient.invalidateQueries({ queryKey: ['cart'] })
        }
      }

      setError(errorMessage)
      return null
    } finally {
      setIsUpdating(false)
      setIsCompletingCheckout(false)
    }
  }

  return {
    step,
    setStep,
    cart,
    shippingOptions: shippingOptions || [],
    loadingShipping,
    submitShippingStep,
    completeCheckout,
    isUpdating,
    error,
    clearError: () => setError(null),
    paymentSession,
    stripeConfig,
  }
}
