import Arborist from "@npmcli/arborist";
import { readTree } from "libnpmfund";

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

  const fundingInfo = await readTree(tree);

  return fundingInfo;
}
