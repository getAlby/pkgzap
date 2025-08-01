import { decodeInvoice } from "@getalby/lightning-tools";
import { useEffect, useState } from "react";
import { useClient } from "../context";
import { cn } from "../lib/utils";
import SimpleBoostWrapper from "./SimpleBoostWrapper";

const BOOST_AMOUNTS = [1, 5, 10, 25, 50, 100];
const ERROR_MESSAGES = [
  "⚠️ Can't find this package. Typo or doesn't exist? 🤔",
  "⚠️ This package does not accept bitcoin tips yet 🥺",
];

type PackageInfoType = {
  packageName?: string;
  details?: {
    description: string;
    lnAddress: string;
  };
};

function SearchBox() {
  const [packageQueryName, setPackageQueryName] = useState<string>("");
  const [packageInfo, setPackageInfo] = useState<PackageInfoType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [amountSats, setAmountSats] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { invoice, setInvoice } = useClient();

  useEffect(() => {
    const decodeInvoiceFn = () => {
      if (invoice) {
        const { satoshi } = decodeInvoice(invoice);
        if (satoshi) {
          setAmountSats(satoshi);
        }
      }
    };

    decodeInvoiceFn();
  }, [invoice]);

  const clearPackageInfo = () => {
    setPackageInfo(null);
    setError(null);
    setAmountSats(null);
    setInvoice("");
    setPackageQueryName("");
    return;
  };

  const fetchPackage = async () => {
    try {
      setInvoice("");
      setAmountSats(null);

      //fetch the package
      setIsLoading(true);
      if (packageQueryName) {
        const data = await fetch(`https://registry.npmjs.org/${packageQueryName}/latest`);
        const packageData = await data.json();

        if (!packageData || packageData === "Not Found") {
          throw new Error(ERROR_MESSAGES[0]);
        } else if (!packageData.funding || packageData.funding.type !== "lightning") {
          throw new Error(ERROR_MESSAGES[1]);
        } else {
          setError(null);
          const lnAddress = packageData.funding.url;
          setPackageInfo({
            packageName: packageData.name,
            details: {
              lnAddress: lnAddress.startsWith("lightning:") ? lnAddress.substring(10) : lnAddress,
              description: packageData.description,
            },
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && ERROR_MESSAGES.includes(error.message)) {
        setError(error.message);
        setPackageInfo({
          packageName: packageQueryName,
        });
      } else {
        setPackageInfo(null);
        setError("An unexpected error occurred. Please try again later :(");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClass = cn(
    "hover:bg-black hover:text-white w-full md:w-[99px] h-12 md:h-[72px] p-6 flex items-center justify-center gap-2 rounded-full font-bold text-2xl md:text-3xl transition-all duration-200 shadow-md border-1 border-white/25",
    isLoading ? "cursor-not-allowed" : "bg-white text-black cursor-pointer",
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen mx-8">
      <div className="w-full flex items-center justify-center flex-col md:flex-row gap-2 md:gap-6">
        <input
          value={packageQueryName}
          onChange={(e) => {
            setPackageQueryName(e.target.value);
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
              fetchPackage();
            }
          }}
          placeholder="Search package name..."
          className="w-full md:max-w-xl h-12 md:h-[72px] rounded-full pl-5 py-2 bg-zap-gradient border border-white/25 text-2xl font-grotesk placeholder-opacity-70 outline-none"
        />
        {packageInfo && packageInfo?.packageName === packageQueryName ? (
          <button onClick={clearPackageInfo} className={`${buttonClass} group`}>
            <img src="./cancel.svg" className="w-5 h-5 filter group-hover:invert" />
          </button>
        ) : (
          <button onClick={fetchPackage} disabled={isLoading} className={buttonClass}>
            {isLoading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2"></span>
            ) : (
              "GO"
            )}
          </button>
        )}
      </div>

      {(packageInfo?.details || error) && (
        <div className="bg-zap-gradient border border-white/25 mt-4 md:mt-6 p-6 rounded-4xl w-full md:w-[699px]">
          <div className="flex flex-col gap-3">
            {packageInfo?.packageName && (
              <h3 className="font-bold text-xl">{packageInfo.packageName}</h3>
            )}

            {error && <p className="text-red-400 mt-4">{error}</p>}
            {packageInfo?.details && !error && (
              <div className="flex flex-col gap-3 text-neutral-100 font-normal ">
                <p className="text-gray-200">{packageInfo.details.description}</p>
                <p className="text-gray-300">
                  Project's lightning address:{" "}
                  <span className="font-medium text-white">{packageInfo.details.lnAddress}</span>
                </p>
              </div>
            )}
          </div>

          {packageInfo?.details && !error && (
            <div className="flex flex-col gap-6 mt-6">
              {amountSats ? (
                <div className="flex flex-col gap-6">
                  <p className="text-green-500">
                    💸 {amountSats} sats went straight to {packageInfo.details.lnAddress}
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

              {/* TODO -  Enable boosting AGAIN once the limitation with simple-boost is fixed. addressed here - (https://github.com/getAlby/simple-boost/issues/8) */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {!amountSats &&
                  BOOST_AMOUNTS.map((amount) => (
                    <div key={`boost-${amount}`}>
                      <SimpleBoostWrapper
                        address={packageInfo.details.lnAddress}
                        amount={amount}
                        className="w-full text-center text-black bg-white rounded-full p-2 font-bold cursor-pointer"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBox;
