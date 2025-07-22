import decode from 'light-bolt11-decoder'
import { useEffect, useState } from 'react'
import { useClient } from '../context'
import SimpleBoostWrapper from './SimpleBoostWrapper'

const boosts = [
  { id: 'pkg1', amount: 1 },
  { id: 'pkg2', amount: 5 },
  { id: 'pkg3', amount: 10 },
  { id: 'pkg4', amount: 25 },
  { id: 'pkg5', amount: 50 },
  { id: 'pkg6', amount: 100 },
]

type ResultType = {
  packageName?: string
  description?: string
  warn?: boolean
  hint?: string
  lnAddress?: string
}

function SearchBox() {
  const [packageQueryName, setPackageQueryName] = useState('')
  const [result, setResult] = useState<ResultType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [amountInSats, setAmountInSats] = useState(0)

  const { invoice, setInvoice } = useClient()

  useEffect(() => {
    const decodeInv = () => {
      if (invoice.length > 1) {
        const amountInSat = decode.decode(invoice) as { sections: { value?: string | number }[] }
        setAmountInSats(+amountInSat.sections[2]?.value / 1000)
      }
    }

    decodeInv()
  }, [invoice])

  const fetchPackage = async () => {
    try {
      //clear the result and input alone - when the cancel icon is clicked
      if (result) {
        setResult(null)
        setPackageQueryName('')
        return
      }
      setInvoice('')
      setAmountInSats(0)

      //fetch the package
      setIsLoading(true)
      if (packageQueryName.length > 1) {
        const response = await fetch(`https://registry.npmjs.org/${packageQueryName}/latest`)
        const packageInfo = await response.json()

        if (!packageInfo || packageInfo === 'Not Found') {
          setResult({
            warn: true,
            packageName: packageQueryName,
            hint: '⚠️ Can’t find this package. Typo or doesn’t exist? 🤔',
          })
          return
        } else if (!packageInfo.funding || packageInfo.funding.type !== 'lightning') {
          setResult({
            warn: true,
            packageName: packageQueryName,
            hint: '⚠️ This package does not accept bitcoin tips yet 🥺',
          })
          return
        } else {
          const lnAddress = packageInfo.funding.url

          setResult({
            warn: false,
            lnAddress: lnAddress.startsWith('lightning:') ? lnAddress.substring(10) : lnAddress,
            packageName: packageInfo.name,
            description: packageInfo.description,
          })
        }
      }
    } catch {
      setResult({
        warn: true,
        hint: 'Something went wrong, please try again :(',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen mx-8">
      <div className="w-full flex items-center justify-center flex-col md:flex-row gap-3">
        <input
          value={packageQueryName}
          onChange={(e) => {
            if (result) {
              setResult(null)
            }
            setPackageQueryName(e.target.value)
          }}
          placeholder="Search package name..."
          className="w-full md:w-[576px] h-12 md:h-[72px] rounded-full pl-5 py-2 bg-zap-gradient border border-white/25 text-2xl font-grotesk placeholder-opacity-70"
        />
        <button
          onClick={fetchPackage}
          disabled={isLoading}
          className={`hover:invert w-full md:w-[120px] h-12 md:h-[72px] flex items-center justify-center gap-2 rounded-full font-bold text-2xl md:text-3xl transition-all duration-200 ${
            isLoading ? 'cursor-not-allowed' : 'bg-white text-black '
          } shadow-md`}
        >
          {isLoading && !result ? (
            <>
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 hover:border-white"></span>
            </>
          ) : (
            <>
              {!result && <span>GO</span>}
              {result && <img src="./cancel.svg" className="w-5 h-5" />}
            </>
          )}
        </button>
      </div>
      {/* Result Card */}
      {result && (
        <div className="bg-zap-gradient mt-4 p-6 rounded-4xl w-full md:w-[675px]">
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-xl">{result?.packageName}</h3>
            {/* description */}
            {result?.warn ? (
              <p className="text-[#FF6A6A] mt-4">{result?.hint}</p>
            ) : (
              <div className="flex flex-col gap-3 text-[#F5F5F5] font-normal ">
                <p>{result?.description}</p>
                <p>
                  Project's lightning address:{' '}
                  <span className="font-medium">{result?.lnAddress}</span>
                </p>
              </div>
            )}
          </div>

          {/* zap */}
          {result?.lnAddress && (
            <div className="flex flex-col  gap-5 mt-10">
              {amountInSats > 0 ? (
                <div className="flex flex-col gap-5">
                  <p className="text-[#16A24A]">
                    💸 {amountInSats} sats went straight to {result?.lnAddress}
                  </p>
                  <div className="flex flex-col gap-1">
                    <p>🤩 Wow, thanks for tipping this project!</p>
                    {/* TODO -  Enable boosting AGAIN once the limitation with simple-boost is fixed. addressed here - (https://github.com/getAlby/simple-boost/issues/8) */}
                    {/* <p>Fancy to add another one on top? 😏</p> */}
                  </div>
                </div>
              ) : (
                <p>🎉 Hurray! You can tip this package. Be generous 😏</p>
              )}
              {/* cards */}

              {/* TODO -  Enable boosting AGAIN once the limitation with simple-boost is fixed. addressed here - (https://github.com/getAlby/simple-boost/issues/8) */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {amountInSats <= 0 &&
                  boosts.map(({ id, amount }) => (
                    <div key={id}>
                      <SimpleBoostWrapper
                        address="dunsin@getalby.com"
                        /* address={result?.lnAddress}  */ amount={amount}
                        className=""
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBox
