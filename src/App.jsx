import React from 'react';
import { useEffect, useState } from 'react';

import Alby from '../assets/alby.png';
import FundLNLogo from '../assets/fund-ln.svg';
import LightningDesignOrange from '../assets/ln-design-orange.png';
import LightningDesignYellow from '../assets/ln-design-yellow.png';
import FundLNLogoText from '../assets/fund-ln-text.png';
import FundLNLogoDarkText from '../assets/fund-ln-text-dark.png';
import PackageDetail from './PackageDetail';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const packageName = urlParams.get('package');

  if (packageName) {
    return <PackageDetail packageName={packageName}/>;
  }
  const [query, setQuery] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView();
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = new URL(window.location);
    url.searchParams.set("package", query);
    window.history.pushState({}, "", url);
    window.location.reload();
  }

  return (
  <div>
    <div className="pt-12 pb-24 min-h-screen bg-[url('../assets/lightning.png')]">
      <div className="text-lg pl-12 font-mono flex flex-col items-start">
        <a href="https://github.com/getAlby/npm-fund-ln">getAlby/npm-fund-ln</a>
        <a href="https://www.npmjs.com/package/fund-ln-cli">npm/fund-ln-cli</a>
        <a href="https://www.npmjs.com/package/fund-ln-lib">npm/fund-ln-lib</a>
      </div>
      <img className="w-96 my-10 mx-auto" src={FundLNLogo} alt="Logo" />
      <img className="w-80 mt-10 mx-auto" src={FundLNLogoText} alt="Logo" />
    </div>
    <div>
      <div style={{background: "linear-gradient(80deg, var(--tw-gradient-stops)), url('../assets/noise.png')"}} className="relative from-[#ffe0008a] from-5% via-yellow-200 via-30% to-[#ffffff99]">
        <div className="flex flex-col items-center justify-center pt-12">
          <img className="drop-shadow-md w-20 mb-12 mx-auto" src={FundLNLogo} alt="Logo" />
          <h1 className="text-5xl font-bold mb-8 text-neutral-700" style={{fontFamily: 'Catamaran'}}>How to use?</h1>
          <div className='drop-shadow-md bg-gray-300 rounded-xl'>
            <div className="shadow-md bg-[radial-gradient(_var(--tw-gradient-stops))] from-neutral-700 to-neutral-800 text-amber-200 rounded-xl px-12 py-3 m-1 text-2xl font-mono">
              npx fund-ln-cli
            </div>
          </div>
          <p className="mt-6 font-mono">Type this in your root directory and boost all your dependencies</p>
        </div>
        <img className="absolute h-1/5" src={LightningDesignOrange} alt="Logo" />
        <div id="developer" className="relative z-50 flex flex-col items-center justify-center py-12">
          <img className="drop-shadow-md w-20 mb-12 mx-auto" src={FundLNLogo} alt="Logo" />
          <h1 className="text-5xl font-bold mb-8 text-neutral-700" style={{fontFamily: 'Catamaran'}}>Developer</h1>
          <p className="text-center font-mono">As a package developer you only have to add the<br/>lightning address to your package.json file.</p>
          <p className="mt-6 font-mono mb-8">Have a look at <a href="https://github.com/getAlby/alby-tools/blob/a8a66d2903925c6f584600badf8b75b87260baa4/package.json#L13-L16" className="underline">this example</a></p>
          <div>
            <p className="mb-2 font-mono text-left">~/package.json</p>
            <div className="drop-shadow-md bg-[radial-gradient(_var(--tw-gradient-stops))] from-neutral-700 to-neutral-800 text-white border-4 rounded-xl p-6 mb-10 text-lg font-mono">
              ...<br/>
              {`"funding": {`}
              <p className="ml-4">{`"type": "lightning",`}</p>
              <p className="ml-4">{`"url": "lightning:hello@getalby.com"`}</p>
              {`},`}<br/>
              ...
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div id="library" className="py-12 px-20">
              <img className="drop-shadow-md w-20 mb-12 mx-auto" src={FundLNLogo} alt="Logo" />
              <h1 className="text-4xl text-center font-bold mb-8 text-neutral-700" style={{fontFamily: 'Catamaran'}}>Library methods</h1>
              <p className="text-center font-mono">You can also fetch funding details of all the dependencies used in your project and send satoshis.<br/> For this, you can use the npm-fund-lib package.</p>
              <div className="flex justify-center">
                <div className="inline-block my-6 drop-shadow-md bg-gray-300 rounded-xl">
                  <div className="shadow-md bg-[radial-gradient(_var(--tw-gradient-stops))] from-neutral-700 to-neutral-800 text-amber-200 rounded-xl px-12 py-3 m-1 text-2xl font-mono">
                    npm i fund-ln-lib
                  </div>
                </div>
              </div>
              <p className="mt-6 mb-2 text-xl font-mono">getFundingDetails</p>
              <p className="mt-2 mb-4 text-sm font-mono">This gives you the funding details of all the dependencies in the package.json of the folder in which this is run</p>
              <div className="w-full drop-shadow-md bg-[radial-gradient(_var(--tw-gradient-stops))] from-neutral-700 to-neutral-800 text-white border-4 rounded-xl p-4 mb-10 text-lg font-mono">
                <p className="text-purple-400">{`import `}<span className="text-yellow-400">{`{ `}<span className="text-red-400">getFundingDetails</span>{` }`}</span> from <span className="text-lime-300">"fund-ln-lib"</span></p>
                <p className="text-purple-400">{`const `}<span className="text-yellow-400">fundingInfo<span className="text-blue-300"> = getFundingDetails</span>{`()`}</span></p>
                <p className="text-white">{`console.`}<span className="text-blue-300">log</span><span className="text-yellow-400">{`(JSON.`}<span className="text-blue-300">stringify</span><span className="text-purple-400">{`(`}<span className="text-white">fundingInfo, <span className='text-yellow-400'>null, 2</span></span>{`)`}</span>{`)`}</span></p>
              </div>
              <p className="mt-6 mb-2 text-xl font-mono">fetchFundingInfo</p>
              <p className="mt-2 mb-4 text-sm font-mono">If you want to fetch the funding data from some arbitrary JSON retrieved from an API or some other file, you can use this function</p>
              <div className="w-full drop-shadow-md bg-[radial-gradient(_var(--tw-gradient-stops))] from-neutral-700 to-neutral-800 text-white border-4 rounded-xl p-4 mb-10 text-lg font-mono">
                <p className="text-purple-400">{`import `}<span className="text-yellow-400">{`{ `}<span className="text-red-400">fetchFundingInfo</span>{` }`}</span> from <span className="text-lime-300">"fund-ln-lib"</span></p>
                <p className="text-purple-400">{`const `}<span className="text-yellow-400">fundingInfo<span className="text-blue-300"> = fetchFundingInfo</span>{`(`}<span className="text-white">packageJsonData</span>{`)`}</span></p>
                <p className="text-white">{`console.`}<span className="text-blue-300">log</span><span className="text-yellow-400">{`(JSON.`}<span className="text-blue-300">stringify</span><span className="text-purple-400">{`(`}<span className="text-white">fundingInfo, <span className='text-yellow-400'>null, 2</span></span>{`)`}</span>{`)`}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <img className="absolute h-2/5 right-1/4" src={LightningDesignYellow} alt="Logo" />
      <div className="flex flex-col items-center justify-center pb-12 bg-[length:120px] bg-[url('../assets/noise.png')]">
        <img className="drop-shadow-md relative z-50 w-20 my-10 mx-auto" src={FundLNLogo} alt="Logo" />
        <div className="relative z-50 flex items-center text-3xl font-bold text-neutral-700" style={{fontFamily: 'Catamaran'}}>
          <div>
            <p className="mb-2">If you don't have a</p>
            <a href="https://lightningaddress.com/" className="inline-block mb-2 text-5xl text-amber-400">lightning address</a>
            <p>Click on the bee!</p>
          </div>
          <a href="https://getalby.com/user/new" className="w-44 ml-36"><img src={Alby} alt="Logo" /></a>
        </div>
        <div className="grayscale opacity-20 bg-center bg-[length:16rem] mt-12 py-8 w-full bg-[url('../assets/alby-logo.png')]"></div>
      </div>
    </div>
    <div style={{background: "linear-gradient(100deg, var(--tw-gradient-stops)), url('../assets/noise.png')"}} className="from-[#ffe000bb] from-10% via-[#ff8f00aa] via-60% to-[#fff19bbb] to-90%">
      <div id="supporter" className="py-12 px-20">
        <img className="drop-shadow-md w-20 mb-12 mx-auto" src={FundLNLogo} alt="Logo" />
        <h1 className="text-5xl text-center font-bold mb-8 text-neutral-700" style={{fontFamily: 'Catamaran'}}>Supporter</h1>
        <p className="mt-6 mb-4 text-lg font-mono">Run the npx fund-ln-cli command in your project directory.<br/>First, it fetches the funding information from the package details by analyzing the dependencies.</p>
        <div className="drop-shadow-md bg-[radial-gradient(_var(--tw-gradient-stops))] from-neutral-700 to-neutral-800 text-white border-4 rounded-xl p-6 mb-10 text-lg font-mono">
          <p>$ npx fund-ln-cli</p>
          <p className="text-yellow-200">
            Send sats to your project's dependencies!
          </p>
          <p>
            Analyzing your package.json...<br/>
            Analyzing package: alby-tools<br/>
            Analyzing package: alby-js-sdk<br/>
            ...
          </p>
          <p className="text-cyan-200">
            Found 4 dependencies with lightning details.
          </p>
        </div>
        <p className="mt-6 mb-4 text-lg font-mono">Now you can enter your desired total amount you want to split among all supported dependencies.</p>
        <div className="drop-shadow-md bg-[radial-gradient(_var(--tw-gradient-stops))] from-neutral-700 to-neutral-800 text-white border-4 rounded-xl p-6 mb-10 text-lg font-mono">
          ...
          <p className="text-cyan-200">Found 4 dependencies with lightning details.</p>
          <p className="text-purple-300">How much do you want to send in total? Amount (in sats): 400</p>
          <p className="text-green-400">Please approve the NWC connection: <span className="text-blue-400 underline">https://nwc.getalby.com/...</span></p>
          And press enter/return to continue...
        </div>
        <p className="mt-6 mb-4 text-lg font-mono">Approve the wallet connection by clicking on the link and you're done! 🚀<br/>Let the sats flow and support your favorite open source projects!</p>
        <div className="drop-shadow-md bg-[radial-gradient(_var(--tw-gradient-stops))] from-neutral-700 to-neutral-800 text-white border-4 rounded-xl p-6 text-lg font-mono">
          ...<br/>
          And press enter/return to continue...<br/>
          Authentication Successful. Saving the NostrWalletConnect URL...
          <p className="text-green-400">Saved in /Users/satoshi/.fund-ln</p>
          Supporting 4 packages with 100 sats each...
          <p className="text-yellow-200">
            alby-tools: <span className="text-green-400">Payment Successful!</span><br/>
            ln-package: <span className="text-green-400">Payment Successful!</span><br/>
            awesome-nostr: <span className="text-green-400">Payment Successful!</span><br/>
            nostr-ln: <span className="text-green-400">Payment Successful!</span>
          </p>
        </div>
      </div>
    </div>

    <div className="flex flex-col px-20 py-12 bg-[length:120px] bg-[url('../assets/noise.png')]">
      <p className="text-sm font-mono">Boost a package directly from here<br/> using the npm-fund-lib methods</p>
      <h1 id="search" className="text-5xl font-bold my-8 text-neutral-700" style={{fontFamily: 'Catamaran'}}>Check Packages</h1>
      <form onSubmit={handleSubmit} className="w-96">
        <label htmlFor="package-search" className="mb-2 text-sm font-mono font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div className="flex items-center">
          <input id="package-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="font-mono block w-full p-2 px-6 text-gray-600 border-4 border-gray-300 text-lg drop-shadow-md rounded-xl bg-gray-50 outline-none" placeholder="package name" required />
          <button type="submit" className="font-mono ml-3 p-2 px-4 bg-[radial-gradient(_var(--tw-gradient-stops))] from-neutral-700 to-neutral-800 text-white border-4 border-gray-300 text-lg drop-shadow-md rounded-xl outline-none">Go</button>
        </div>
      </form>
    </div>

    <div className="flex justify-between items-center bg-neutral-800 p-6">
      <div className="flex ">
        <img className="h-20 mr-6" src={FundLNLogo} alt="Alby logo" />
        <img className="h-20" src={FundLNLogoDarkText} alt="Alby logo" />
      </div>
    </div>
  </div>
)}

export default App
