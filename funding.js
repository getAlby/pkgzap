import { getFundingDetails } from "./dist/index.module.js";
//await getFundingDetails()
console.log((await getFundingDetails({includeIndirectDeps: true})))
//console.log((await getFundingDetails({includeIndirectDeps: true})).children.get("@babel/plugin-transform-spread").edgesOut.get("@babel/core").to.package)
//console.log(await getFundingDetails({includeIndirectDeps: true}))