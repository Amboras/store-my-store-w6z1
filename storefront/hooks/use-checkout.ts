'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { medusaClient } from '@/lib/medusa-client'
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

  const stripeConfig = useStripeConfig()

  // Fetch shipping options immediately — only needs cart_id (region-based)
  const { data: shippingOptions, isLoading: loadingShipping } = useQuery({
    queryKey: ['shipping-options', cart?.id],
    queryFn: async () => {
      if (!cart?.id) return []
      const { shipping_options } = await medusaClient.store.fulfillment.listCartOptions({
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
      await medusaClient.store.cart.update(cart.id, {
        email,
        shipping_address: address,
        billing_address: address,
      })

      // Set shipping method — only update cart cache once, after final call
      const { cart: finalCart } = await medusaClient.store.cart.addShippingMethod(cart.id, {
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

      const response = await medusaClient.store.payment.initiatePaymentSession(cart, {
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
    setIsUpdating(true)
    setError(null)

    try {
      if (!stripeConfig.paymentReady) {
        await medusaClient.store.payment.initiatePaymentSession(cart, {
          provider_id: 'pp_system_default',
        })
      }

      const result = await medusaClient.store.cart.complete(cart.id)

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
      setError(err?.message || 'Failed to place order')
      return null
    } finally {
      setIsUpdating(false)
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
