import axios from 'axios';
import { BoostButton } from 'boost-button';
import React from 'react';
import { useState } from 'react';

import AlbyLogo from '../assets/alby-logo-dark.svg';
import FundLNLogo from '../assets/alby-fund-ln.png';

function App() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [searched, setSearched] = useState(false);
  const [lnAddress, setLnAddress] = useState("");
  const [packageDNE, setPackageDNE] = useState(false);
  const [query, setQuery] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`https://registry.npmjs.org/${query}/latest`);
      const packageInfo = response.data;
      const fundingInfo = packageInfo.funding;

      setTitle(packageInfo.name)
      setDesc(packageInfo.description)

      if (!fundingInfo || (fundingInfo && fundingInfo.type !== "lightning")) {
        setQuery("");
        setSearched(true);
        return;
      }

      setLnAddress(fundingInfo.url);
    } catch (error) {
      console.error(error);
      setPackageDNE(true);
    }
    setQuery("");
    setSearched(true);
  }
  return (
  <div>
    <div className="relative flex flex-col items-center justify-center pt-12 pb-24 bg-gradient-to-tr from-[#FFDF6F] to-[#ECA572] via-[#F8C455]">
      <img className="w-48 mb-5" src={FundLNLogo} alt="Logo" />
      <h1 className="text-6xl font-bold mb-2" style={{fontFamily: 'Catamaran'}}>{searched && !packageDNE ? `< ${title} >` : "Fund LN"}</h1>
      <h3 className="text-sm font-bold mb-8">{searched && !packageDNE ? desc : "Send sats to your project dependencies via Lightning"}</h3>
      {!searched ? <form id="search-form" onSubmit={handleSubmit} className="w-80">   
        <label htmlFor="package-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} id="search-input" className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-full bg-gray-50 focus:ring-neutral-500 focus:border-neutral-500" placeholder="Search Packages..." required />
          <button type="submit" className="text-white absolute right-2.5 bottom-2.5 bg-neutral-800 hover:bg-neutral-950 focus:ring-4 focus:outline-none focus:ring-neutral-300 font-medium rounded-full text-sm px-4 py-2">Search</button>
        </div>
      </form> : <>
        {packageDNE && <div className="text-sm text-center font-medium px-6 py-8 mb-8 border-2 border-black rounded-lg">
          <p>The package you searched for does not exist.</p>
        </div>}
        {!packageDNE && lnAddress && <div className="mb-8">
          <BoostButton lnurl={lnAddress} expanded/>
        </div>}
        {!packageDNE && !lnAddress && <div className="text-sm text-center font-medium px-6 py-8 mb-8 border-2 border-black rounded-lg">
          <p>LN Funding details are not available for this package</p>
          <a id="depLink" href={`https://www.npmjs.com/package/${title}`} className="underline">Tell the dependency owner to add LN info?</a>
        </div>}
        <div className="flex items-center cursor-pointer" onClick={() => {
          setTitle("")
          setDesc("")
          setLnAddress("")
          setPackageDNE(false)
          setSearched(false)
          setQuery("")
        }}>
          <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          <p className="text-lg font-bold ml-1">Clear Search</p>
        </div>
      </>}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 33" width="375" height="33" fill="none" preserveAspectRatio="none" className="absolute bottom-0 w-full block" style={{height: '30px'}}><path fill="#F9FAFB" d="M685 327c0 180-223 326-497 326s-497-146-497-326C-309 146-86 0 188 0s497 146 497 327Z"></path></svg>
    </div>

    <div className="flex flex-col items-center justify-center py-12 bg-gray-50">
      <h1 className="text-5xl font-bold mb-6" style={{fontFamily: 'Catamaran'}}>Install Fund LN</h1>
      <div className="flex items-center mb-4">
        <div className="bg-slate-100 border border-gray-300 rounded-lg px-4 py-1 mr-2">
          <code className="text-red-500 text-sm">yarn add fund-ln-cli</code>
        </div>
        <code className="text-red-500 text-sm mr-2">OR</code>
        <div className="bg-slate-100 border border-gray-300 rounded-lg px-4 py-1">
          <code className="text-red-500 text-sm">npm i fund-ln-cli</code>
        </div>
      </div>
      <div className="flex items-center">
        <p className="text-sm font-bold mr-2">And then do</p>
        <div className="bg-neutral-800 border rounded-lg px-2 py-1 mr-2">
          <code className="text-green-300 text-sm">npx fund-ln</code>
        </div>
        <p className="text-sm font-bold">to boost ⚡️ your dependencies</p>
      </div>
    </div>

    <div className="flex flex-col items-center justify-center pt-12 pb-12 bg-gradient-to-tr from-[#FFDF6F] to-[#ECA572] via-[#F8C455]">
      <h1 className="text-5xl font-bold mb-6" style={{fontFamily: 'Catamaran'}}>How does it work?</h1>
      <p className="text-lg font-bold mb-4">First, it fetches the funding information from the dependencies</p>
      <div className="flex flex-col text-sm bg-neutral-800 rounded-lg p-3">
        <code className="text-gray-100">$ npx fund-ln</code>
        <code className="text-yellow-300">Send sats to your project's dependencies!</code>
        <code className="text-gray-100">Analyzing your package.json...</code>
        <code className="text-gray-100">Analyzing package: alby-tools</code>
        <code className="text-gray-100">Analyzing package: alby-js-sdk</code>
        <code className="text-gray-100">...</code>
        <code className="text-cyan-300">Found 4 dependencies with lightning details.</code>
      </div>
      <p className="text-lg font-bold mt-8 mb-4">Now you can enter your desired amount</p>
      <div className="flex flex-col text-sm bg-neutral-800 rounded-lg p-3">
        <code className="text-gray-100">...</code>
        <code className="text-cyan-300">Found 4 dependencies with lightning details.</code>
        <div>
          <code className="text-purple-300">How much do you want to send in total? Amount (in sats): </code>
          <code className="text-gray-100">400</code>
        </div>
        <div>
          <code className="text-green-400 mr-2">Please approve the NWC connection:</code>
          <code className="text-blue-400 underline">https://nwc.getalby.com/...</code>
        </div>
        <code className="text-gray-100">And press enter/return to continue...</code>
      </div>
      <p className="text-lg font-bold mt-8 mb-4">Approve the NWC connection by clicking on the link and done! 🚀</p>
      <div className="flex flex-col bg-neutral-800 text-sm rounded-lg p-3">
        <code className="text-gray-100">...</code>
        <code className="text-gray-100">And press enter/return to continue...</code>
        <code className="text-gray-100">Authentication Successful. Saving the NostrWalletConnect URL...</code>
        <code className="text-green-400 mr-2">Saved in /Users/satoshi/.fund-ln</code>
        <code className="text-gray-100">Supporting 4 packages with 100 sats each...</code>
        <div>
          <code className="text-yellow-400 mr-2">alby-tools:</code>
          <code className="text-green-400 ">Payment Successful!</code>
        </div>
        <div>
          <code className="text-yellow-400 mr-2">ln-package:</code>
          <code className="text-green-400">Payment Successful!</code>
        </div>
        <div>
          <code className="text-yellow-400 mr-2">awesome-nostr:</code>
          <code className="text-green-400">Payment Successful!</code>
        </div>
        <div>
          <code className="text-yellow-400 mr-2">nostr-ln:</code>
          <code className="text-green-400">Payment Successful!</code>
        </div>
      </div>
    </div>
    <div className="bg-neutral-800">
      <a href="https://www.getalby.com">
        <img className="w-24 py-2 m-auto" src={AlbyLogo} alt="Alby logo" />
      </a>
    </div>
  </div>
)}

export default App