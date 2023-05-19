window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const packageName = urlParams.get('package');
  if (packageName) {
    fetchPackageDetails(packageName);
  }
   else {
    window.location.href = "/"
  }
});

function fundingUnavailable() {
  const nameElement = document.getElementById('packageName');
  nameElement.textContent = "< "+packageInfo.name+" >";
  
  const descriptionElement = document.getElementById('packageDescription');
  descriptionElement.textContent = packageInfo.description;

}

async function fetchPackageDetails(packageName) {
  try {
    const response = await axios.get(`https://registry.npmjs.org/${packageName}/latest`);
    const packageInfo = response.data;
    const fundingInfo = packageInfo.funding;

    const nameElement = document.getElementById('packageName');
    nameElement.textContent = `< ${packageInfo.name} >`;
    
    const descriptionElement = document.getElementById('packageDescription');
    descriptionElement.textContent = packageInfo.description;

    if (!fundingInfo || (fundingInfo && fundingInfo.type !== "lightning")) {
      const fundingUnavailable = document.getElementById('fundingUnavailable');
      fundingUnavailable.classList.remove('hidden');
      return;
    }

    const boostButton = document.getElementById('boostButton');

    boostButton.children[0].textContent = `Boost ⚡️ ${packageInfo.name}`
    boostButton.href=`lightning:${fundingInfo.url}`;
    boostButton.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    const packageDNE = document.getElementById('packageDNE');
    packageDNE.classList.remove('hidden');
  }
}