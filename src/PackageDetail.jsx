import axios from 'axios';
import { BoostButton } from 'boost-button';
import React from 'react';
import { useEffect, useState } from 'react';

import Alby from '../assets/alby-logo-dark.svg';
import PkgZapLogo from '../assets/pkgzap.svg';

function PackageDetail({packageName}) {
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(false);
  const [desc, setDesc] = useState("");
  const [warn, setWarn] = useState("");
  const [lnAddress, setLnAddress] = useState("");

  const [query, setQuery] = useState("");

  const goHome = () => {
    const url = window.location.href.split('?')[0];
    window.history.pushState({}, "", url);
    window.location.reload();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = new URL(window.location);
    url.searchParams.set("package", query);
    window.history.pushState({}, "", url);
    window.location.reload();
  }

  useEffect(() => {
    const packageSearch = async () => {
      try {
        const response = await axios.get(`https://registry.npmjs.org/${packageName}/latest`);
        const packageInfo = response.data;
        const fundingInfo = packageInfo.funding;

        setDesc(packageInfo.description);
  
        if (!fundingInfo || (fundingInfo && fundingInfo.type !== "lightning")) {
          setWarn("LN Funding details are not available for this package.");
          setHint(true);
          return;
        }
        const lnAddress = fundingInfo.url;
        setLnAddress(lnAddress.startsWith("lightning:") ? lnAddress.substring(10) : lnAddress);
      } catch (error) {
        console.error(error);
        setWarn("The package you searched for does not exist.");
      } finally {
        setLoading(false);
      }
    }
    packageSearch();
  }, []);
  return (
  <div className="flex flex-col min-h-screen">
    <div className="flex justify-between items-center bg-neutral-800 py-3 px-6">
      <div className="flex cursor-pointer items-center" onClick={goHome}>
        <img className="h-16 mr-4" src={PkgZapLogo} alt="Alby logo" />
        <h1 className="text-4xl font-bold text-white" style={{fontFamily: 'Catamaran'}} alt="Alby logo">PkgZap</h1>
      </div>
    </div>
    <div style={{background: "linear-gradient(100deg, var(--tw-gradient-stops)), url('../assets/noise.png')"}} className="from-[#fffbdfbb] from-5% via-[#ffe83daa] via-30% to-[#fff7c1d4] to-90%">
      <div className="py-12 px-20">
        <p className="font-mono">pkgzap?package={packageName}</p>
        <h1 className="text-5xl font-bold my-8 text-neutral-700" style={{fontFamily: 'Catamaran'}}>{packageName}</h1>
        {
          loading ?
            <p className="mt-6 mb-4 text-lg font-mono max-w-xl">loading...</p> :
            <>
              {desc && <p className="mt-6 mb-4 text-lg font-mono max-w-xl">{desc}</p>}
              {warn && <p className="mt-6 mb-4 font-mono text-red-500">⚠️ {warn}</p>}
              {hint && <p className="mt-2 mb-4 font-mono text-neutral-600">Let developers know how they can receive sats: <a className="underline" href="https://getalby.github.io/pkgzap/#developer">https://getalby.github.io/pkgzap/#developer</a></p>}
              {!warn && lnAddress && <div className="mt-12">
                <BoostButton lnurl={lnAddress} expanded/>
              </div>}
            </>
        }
        
        <p className="mt-12 font-mono">
          <span className="cursor-pointer" onClick={goHome}>
            {`< Go Back`}
          </span>
        </p>
      </div>
    </div>

    <div className="grow flex flex-col py-12 px-20 bg-[length:120px] bg-[url('../assets/noise.png')]">
      <p className="font-mono">Search Other Packages</p>
      <h1 id="search" className="text-5xl font-bold my-8 text-neutral-700" style={{fontFamily: 'Catamaran'}}>Check Packages</h1>
      <form onSubmit={handleSubmit} className="w-96">
        <label htmlFor="package-search" className="mb-2 text-sm font-mono font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div className="flex items-center">
          <input id="package-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="font-mono block w-full p-2 px-6 text-gray-600 border-4 border-gray-300 text-lg drop-shadow-md rounded-xl bg-gray-50 outline-none" placeholder="package name" required />
          <button type="submit" className="font-mono ml-3 p-2 px-4 bg-[radial-gradient(_var(--tw-gradient-stops))] from-neutral-700 to-neutral-800 text-white border-4 border-gray-300 text-lg drop-shadow-md rounded-xl outline-none">Go</button>
        </div>
      </form>
    </div>

    <div className="flex justify-between items-center bg-neutral-800 px-6 py-2">
      <div className="flex ">
        <img className="h-12 mr-6" src={Alby} alt="Alby logo" />
      </div>
    </div>
  </div>
)}

export default PackageDetail
