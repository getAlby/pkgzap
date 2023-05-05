import Arborist from "@npmcli/arborist";
import { readTree } from "./getFunding";

export { cli } from "./bin/index.js";

function allDeps(json) {
  const deps: string[] = [];
  if (json.dependencies) {
    deps.push(...Object.keys(json.dependencies))
  }
  if (json.devDependencies) {
    deps.push(...Object.keys(json.devDependencies))
  }
  if (json.peerDependencies) {
    deps.push(...Object.keys(json.peerDependencies))
  }
  if (json.bundleDependencies) {
    deps.push(...Object.keys(json.bundleDependencies))
  }
  if (json.optionalDependencies) {
    deps.push(...Object.keys(json.optionalDependencies))
  }
  return deps;
}

export async function fetchFundingInfo(json) {
  const packages = allDeps(json);
  const fundingInfo = {};
  for (const packageName of packages) {
    const url = `https://registry.npmjs.org/${packageName}/latest`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const { funding } = data;
      fundingInfo[packageName] = funding;
    } else {
      console.error(`Failed to fetch package info for ${packageName}`);
    }
  }
  return fundingInfo;
}

export async function getFundingDetails(options?: {includeIndirectDeps: false}) {
  const arborist = new Arborist();
  const tree = await arborist.buildIdealTree();

  if (!options || !options.includeIndirectDeps) {
    const actualChildren = new Map();

    tree.edgesOut.forEach((value, key) => {
      const node = tree.children.get(key);
      node.edgesOut = new Map();
      actualChildren.set(key, node);
    });

    tree.children = actualChildren;
  }

  const packagesInfo = await readTree(tree);

  return packagesInfo.dependencies;
}
