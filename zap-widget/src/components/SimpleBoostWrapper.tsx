import { useEffect, useRef } from 'react'
import 'simple-boost'

// Delay rendering until custom element is ready and you're in the browser
const SimpleBoostWrapper = ({
  address,
  amount = 10,
  currency = 'usd',
  className = '',
}: {
  address: string
  amount?: number
  currency?: string
  className?: string
}) => {

  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import('simple-boost').then(() => {
      const boostEl = wrapperRef.current?.querySelector('simple-boost')
      if (boostEl) {
        boostEl.addEventListener('success', (e: Event) => {
          console.log('Thanks for the sats! Payment preimage:', e)
        })
      }
    })
  }, [])

  return (
    <div
      ref={wrapperRef}
      dangerouslySetInnerHTML={{
        __html: `<simple-boost address="${address}" amount="${amount}" currency="${currency}" class="${className}">$${amount}</simple-boost>`,
      }}
    />
  )
}

export default SimpleBoostWrapper
