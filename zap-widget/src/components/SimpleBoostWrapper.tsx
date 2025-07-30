import { useEffect, useRef } from 'react'
import 'simple-boost'
import { useClient } from '../context'

const SimpleBoostWrapper = ({
  address,
  amount = 1,
  currency = 'usd',
  className = '',
}: {
  address: string
  amount?: number
  currency?: string
  className?: string
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { setInvoice } = useClient()
  useEffect(() => {
    let boostEl: Element | null = null
    const handleSuccess = (e: Event) => {
      const customEvent = e as CustomEvent<{ pr: string }>
      setInvoice(customEvent.detail.pr)
    }

    import('simple-boost').then(() => {
      boostEl = wrapperRef.current?.querySelector('simple-boost')
      if (boostEl) {
        boostEl.addEventListener('success', handleSuccess)
      }
    })

    return () => {
      if (boostEl) {
        boostEl.removeEventListener('success', handleSuccess)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // TODO: remove  dangerouslySetInnerHTML Delay rendering until custom element is ready and you're in the browser
  // Do this once (https://github.com/getAlby/simple-boost/issues/8) is fixed
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
