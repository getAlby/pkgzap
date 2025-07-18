import { useState } from 'react'
import SimpleBoostWrapper from './SimpleBoostWrapper'

const boosts = [
  { id: 'pkg1', amount: 1 },
  { id: 'pkg2', amount: 5 },
  { id: 'pkg3', amount: 10 },
  { id: 'pkg4', amount: 25 },
  { id: 'pkg5', amount: 50 },
  { id: 'pkg6', amount: 100 },
]

function SearchBox() {
  const [error, setError] = useState(true)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen mx-4">
      <div className="w-full flex items-center justify-center flex-col md:flex-row gap-3">
        <input
          className="w-full md:w-[576px] h-12 md:h-[72px] rounded-full pl-5 py-2 bg-zap-gradient border border-white/25 text-2xl font-grotesk placeholder-opacity-70"
          placeholder="Search package name..."
        />
        <button
          onClick={() => setError((prev) => !prev)}
          // disabled={true}
          className="w-full md:w-[99px] h-12 md:h-[72px] flex items-center justify-center  rounded-full bg-white text-black font-bold text-2xl md:text-3xl transition-colors hover:bg-black hover:text-white"
        >
          GO
          {/* <img src="./cancel.svg" className="hover:invert"/> */}
        </button>
      </div>
      {/* Result Card */}
      <div className="bg-zap-gradient mt-4 p-6 rounded-4xl w-full md:w-[675px]">
        <div className="flex flex-col gap-3">
          <h3 className="font-bold">@getalby/pkgzap</h3>
          {/* description */}
          {error ? (
            // <p className="text-[#FF6A6A] mt-4">⚠️ This package does not accept bitcoin tips yet 🥺</p>
            <p className="text-[#FF6A6A] mt-4">
              ⚠️ Can’t find this package. Typo or doesn’t exist? 🤔
            </p>
          ) : (
            <div className="flex flex-col gap-3 text-[#F5F5F5] font-normal ">
              <p>View funding information of your dependencies and tip them via lightning.</p>
              <p>
                Project’s lightning address: <span className="font-medium">hello@getalby.com</span>
              </p>
            </div>
          )}
        </div>

        {/* zap */}
        {!error && (
          <div className="flex flex-col  gap-3 mt-4">
            <p>🎉 Hurray! You can tip this package. Be generous 😏</p>
            {/* cards */}

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {boosts.map(({ id, amount }) => (
                <div key={id}>
                  <SimpleBoostWrapper address="dunsin@getalby.com" amount={amount} className="" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBox
