'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCheckout, CheckoutStep, ShippingAddress } from '@/hooks/use-checkout'
import { useCheckoutSettings } from '@/hooks/use-checkout-settings'
import { useAuth } from '@/hooks/use-auth'
import { useCart } from '@/hooks/use-cart'
import { ShoppingBag, ChevronRight, Loader2, Check, ArrowLeft, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { StripePaymentForm } from '@/components/checkout/stripe-payment-form'
import { PromoCodeInput } from '@/components/checkout/promo-code-input'
import { getProductImage } from '@/lib/utils/placeholder-images'
import { trackBeginCheckout } from '@/lib/analytics'
import { formatPrice } from '@/lib/utils/format-price'

const steps: { key: CheckoutStep; label: string }[] = [
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const {
    step, setStep, cart, shippingOptions, loadingShipping,
    submitShippingStep, completeCheckout,
    isUpdating, error, clearError, paymentSession, stripeConfig,
  } = useCheckout()

  const { data: checkoutSettings } = useCheckoutSettings()
  const { customer, isLoggedIn, isLoading: authLoading } = useAuth()
  const {
    appliedPromoCodes, discountTotal, applyPromoCode, removePromoCode,
    isApplyingPromo, isRemovingPromo,
  } = useCart()

  const [email, setEmail] = useState('')
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [address, setAddress] = useState<ShippingAddress>({
    first_name: '', last_name: '', address_1: '', address_2: '',
    company: '', city: '', postal_code: '', country_code: '', phone: '',
  })
  const [selectedShipping, setSelectedShipping] = useState('')

  const hasItems = cart?.items && cart.items.length > 0
  const currency = cart?.currency_code || 'usd'

  const trackedCheckout = useRef(false)
  useEffect(() => {
    if (cart?.id && hasItems && !trackedCheckout.current) {
      trackedCheckout.current = true
      trackBeginCheckout(cart.id, cart.total, currency)
    }
  }, [cart?.id, hasItems, cart?.total, currency])

  useEffect(() => {
    if (!authLoading && checkoutSettings?.require_account && !isLoggedIn) {
      toast.error('Please sign in to continue to checkout')
      router.push('/auth/login?redirect=/checkout')
    }
  }, [authLoading, checkoutSettings?.require_account, isLoggedIn, router])

  useEffect(() => {
    if (customer?.email && !email) {
      setEmail(customer.email)
    }
  }, [customer?.email, email])

  const countryCodeSet = useRef(false)
  useEffect(() => {
    if (countryCodeSet.current) return
    const countryCode = cart?.shipping_address?.country_code || cart?.region?.countries?.[0]?.iso_2
    if (countryCode) {
      countryCodeSet.current = true
      setAddress((prev) => ({ ...prev, country_code: countryCode }))
    }
  }, [cart?.shipping_address?.country_code, cart?.region?.countries])

  useEffect(() => {
    if (checkoutSettings?.marketing_opt_in?.enabled && checkoutSettings.marketing_opt_in.pre_checked) {
      setMarketingOptIn(true)
    }
  }, [checkoutSettings?.marketing_opt_in])

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShipping) {
      toast.error('Please select a shipping method')
      return
    }
    clearError()
    await submitShippingStep(email, address, selectedShipping)
  }

  const buildSuccessUrl = (order: { id: string }) => {
    return `/checkout/success?order=${encodeURIComponent(order.id)}`
  }

  const handlePlaceOrder = async () => {
    clearError()
    const order = await completeCheckout()
    if (order) {
      toast.success('Order placed successfully!')
      router.push(buildSuccessUrl(order))
    }
  }

  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  const inputClass = "border-b border-foreground/20 bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => {
            const isActive = s.key === step
            const isCompleted = step === 'payment' && s.key === 'shipping'
            return (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                <button
                  onClick={() => { if (isCompleted) setStep('shipping') }}
                  disabled={!isCompleted}
                  className={`text-sm transition-colors ${
                    isActive ? 'font-semibold text-foreground' :
                    isCompleted ? 'text-foreground cursor-pointer underline underline-offset-4' :
                    'text-muted-foreground cursor-default'
                  }`}
                >
                  {isCompleted && <Check className="h-3.5 w-3.5 inline mr-1" />}
                  {s.label}
                </button>
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-16">
          {/* ============ LEFT COLUMN ============ */}
          <div>
            {error && (
              <div className="flex items-start gap-3 p-4 mb-6 border border-destructive/30 rounded-sm bg-destructive/5">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* STEP 1: Address form only */}
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} id="shipping-form" className="space-y-8">
                <section>
                  <h2 className="text-xs uppercase tracking-widest font-semibold mb-4">Contact</h2>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address" className={`w-full ${inputClass}`} />
                  {checkoutSettings?.marketing_opt_in?.enabled && checkoutSettings.marketing_opt_in.where !== 'signin' && (
                    <label className="flex items-start gap-2 mt-4 cursor-pointer">
                      <input type="checkbox" checked={marketingOptIn} onChange={(e) => setMarketingOptIn(e.target.checked)} className="w-4 h-4 mt-0.5 text-foreground focus:ring-2 focus:ring-foreground rounded" />
                      <span className="text-sm text-muted-foreground">Email me with news and offers</span>
                    </label>
                  )}
                </section>

                <section>
                  <h2 className="text-xs uppercase tracking-widest font-semibold mb-4">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {checkoutSettings?.full_name === 'full' && (
                      <input type="text" value={address.first_name} onChange={(e) => updateAddress('first_name', e.target.value)} required placeholder="First name" className={inputClass} />
                    )}
                    <input type="text" value={address.last_name} onChange={(e) => updateAddress('last_name', e.target.value)} required placeholder="Last name" className={`${inputClass} ${checkoutSettings?.full_name === 'last_only' ? 'col-span-2' : ''}`} />
                    {checkoutSettings?.company_name === 'optional' && (
                      <input type="text" value={address.company} onChange={(e) => updateAddress('company', e.target.value)} placeholder="Company (optional)" className={`col-span-2 ${inputClass}`} />
                    )}
                    <input type="text" value={address.address_1} onChange={(e) => updateAddress('address_1', e.target.value)} required placeholder="Address" className={`col-span-2 ${inputClass}`} />
                    {checkoutSettings?.address_line_2 !== 'hidden' && (
                      <input type="text" value={address.address_2} onChange={(e) => updateAddress('address_2', e.target.value)} required={checkoutSettings?.address_line_2 === 'required'} placeholder={checkoutSettings?.address_line_2 === 'required' ? 'Apartment, suite, etc.' : 'Apartment, suite, etc. (optional)'} className={`col-span-2 ${inputClass}`} />
                    )}
                    <input type="text" value={address.city} onChange={(e) => updateAddress('city', e.target.value)} required placeholder="City" className={inputClass} />
                    <input type="text" value={address.postal_code} onChange={(e) => updateAddress('postal_code', e.target.value)} required placeholder="Postal code" className={inputClass} />
                    <input type="text" value={address.phone} onChange={(e) => updateAddress('phone', e.target.value)} required={checkoutSettings?.phone === 'required'} placeholder={checkoutSettings?.phone === 'required' ? 'Phone' : 'Phone (optional)'} className={`col-span-2 ${inputClass}`} />
                  </div>
                </section>
              </form>
            )}

            {/* STEP 2: Payment */}
            {step === 'payment' && (
              <div className="space-y-6">
                <div className="p-4 border rounded-sm bg-muted/30 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact</span>
                    <span>{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ship to</span>
                    <span>{address.address_1}, {address.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span>{shippingOptions.find((o: any) => o.id === selectedShipping)?.name || 'Selected'}</span>
                  </div>
                </div>

                <section>
                  <h2 className="text-xs uppercase tracking-widest font-semibold mb-4">Payment</h2>
                  {stripeConfig.paymentReady && paymentSession?.client_secret && stripeConfig.publishableKey ? (
                    <StripePaymentForm
                      clientSecret={paymentSession.client_secret}
                      stripeAccountId={paymentSession.stripe_account_id}
                      publishableKey={stripeConfig.publishableKey}
                      isCompletingOrder={isUpdating}
                      onPaymentSuccess={async () => {
                        const order = await completeCheckout()
                        if (order) {
                          toast.success('Order placed successfully!')
                          router.push(buildSuccessUrl(order))
                        }
                      }}
                      onError={(msg) => { clearError(); toast.error(msg) }}
                    />
                  ) : isUpdating && stripeConfig.paymentReady ? (
                    <div className="border rounded-sm p-6 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Initializing payment...</span>
                    </div>
                  ) : (
                    <div className="border rounded-sm p-6">
                      <p className="text-sm text-muted-foreground">
                        This is a demo store. Orders are placed using the system payment provider — no real payment is processed.
                      </p>
                    </div>
                  )}
                </section>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('shipping')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  {!stripeConfig.paymentReady && (
                    <button onClick={handlePlaceOrder} disabled={isUpdating} className="flex-1 bg-foreground text-background py-3.5 text-sm font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Place Order
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============ RIGHT COLUMN: Order Summary + Shipping Methods ============ */}
          <div>
            <div className="sticky top-24 space-y-6">
              {/* Order Summary */}
              {/* Order Summary */}
              <div className="border rounded-sm p-6">
                <h2 className="text-xs uppercase tracking-widest font-semibold mb-6">Order Summary</h2>
                {!hasItems ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
                    <p className="mt-3 text-sm text-muted-foreground">Your bag is empty</p>
                    <Link href="/products" className="mt-3 inline-block text-sm font-semibold underline underline-offset-4">Continue Shopping</Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart?.items?.map((item: any) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden bg-muted rounded-sm">
                            <Image src={getProductImage(item.thumbnail, item.product_id || item.id)} alt={item.title} fill className="object-cover" />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">{item.quantity}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            {item.variant?.title && item.variant.title !== 'Default' && (
                              <p className="text-xs text-muted-foreground">{item.variant.title}</p>
                            )}
                          </div>
                          <p className="text-sm font-medium">{formatPrice(item.unit_price, currency)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <PromoCodeInput
                        appliedPromoCodes={appliedPromoCodes}
                        discountTotal={discountTotal}
                        currencyCode={currency}
                        isApplyingPromo={isApplyingPromo}
                        isRemovingPromo={isRemovingPromo}
                        onApply={applyPromoCode}
                        onRemove={removePromoCode}
                      />
                    </div>

                    <div className="space-y-2 text-sm border-t pt-4">
                      {(() => {
                        const isTaxInclusive = cart?.items?.some((item: any) => item.is_tax_inclusive)
                        const checkoutSubtotal = isTaxInclusive
                          ? ((cart as any)?.original_item_total ?? 0)
                          : ((cart as any)?.original_item_subtotal ?? cart?.subtotal ?? 0)
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>{formatPrice(checkoutSubtotal, currency)}</span>
                            </div>
                            {discountTotal > 0 && (
                              <div className="flex justify-between text-green-700 dark:text-green-500">
                                <span className="text-muted-foreground">Discount</span>
                                <span>-{formatPrice(discountTotal, currency)}</span>
                              </div>
                            )}
                            {cart?.shipping_total != null && cart.shipping_total > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{formatPrice(cart.shipping_total, currency)}</span>
                              </div>
                            )}
                            {cart?.tax_total != null && cart.tax_total > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  {isTaxInclusive ? 'Includes tax' : 'Tax'}
                                </span>
                                <span>{isTaxInclusive ? '' : '+'}{formatPrice(cart.tax_total, currency)}</span>
                              </div>
                            )}
                          </>
                        )
                      })()}
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-semibold">Total</span>
                        <span className="font-heading text-lg font-semibold">{formatPrice(cart?.total || 0, currency)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Shipping Method — on the right, below order summary */}
              {step === 'shipping' && (
                <div className="border rounded-sm p-6">
                  <h2 className="text-xs uppercase tracking-widest font-semibold mb-4">Shipping Method</h2>
                  {loadingShipping ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : shippingOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No shipping options available.</p>
                  ) : (
                    <div className="space-y-2">
                      {shippingOptions.map((option: any) => {
                        const price = option.amount != null ? option.amount : option.prices?.[0]?.amount
                        const priceLabel = price === 0 ? 'Free' : price != null ? formatPrice(price, currency) : '—'
                        return (
                          <label
                            key={option.id}
                            className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-colors ${
                              selectedShipping === option.id ? 'border-foreground' : 'hover:border-foreground/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input type="radio" name="shipping" value={option.id} checked={selectedShipping === option.id} onChange={() => setSelectedShipping(option.id)} className="accent-foreground" />
                              <div>
                                <p className="text-sm font-medium">{option.name}</p>
                                {option.type?.description && (
                                  <p className="text-xs text-muted-foreground">{option.type.description}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-medium">{priceLabel}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  <button
                    type="submit"
                    form="shipping-form"
                    disabled={isUpdating || !selectedShipping || !hasItems}
                    className="w-full mt-4 bg-foreground text-background py-3.5 text-sm font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Continue to Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compliance Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-xs text-muted-foreground">
            By completing your order, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </>
  )
}
