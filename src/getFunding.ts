
type PackageInfoResult = {
  length: number;
  name?: string;
  version?: string;
  funding?: any;
  dependencies?: Record<string, PackageInfo>;
}

export type PackageInfo = {
  version: string;
  funding: any;
  dependencies: Record<string, PackageInfo>;
};

type ArboristEdge = {
  overridden?: any;
  peerConflicted?: boolean | undefined;
  error?: any;
  to?: any;
  from?: any;
  name: any;
  spec: any;
  type: any;
}

// supports object funding and string shorthand, or an array of these
// if original was an array, returns an array; else returns the lone item
function normalizeFunding (funding) {
  const normalizeItem = item =>
    typeof item === 'string' ? { url: item } : item
  const sources = [].concat(funding || []).map(normalizeItem)
  return Array.isArray(funding) ? sources : sources[0]
}

// Is the value of a `funding` property of a `package.json`
// a valid type+url for `npm fund` to display?
function isValidFunding (funding) {
  if (!funding) {
    return false
  }

  if (Array.isArray(funding)) {
    return funding.every(f => !Array.isArray(f) && isValidFunding(f))
  }

  // Originally the code checks for proper URLs
  if (funding.type === 'lightning') {
    return true;
  }

  return false;
}

const empty = () => Object.create(null)

export function readTree (tree) {
  let packageWithFundingCount = 0
  const seen = new Set()
  const _trailingDependencies = Symbol('trailingDependencies')

  function tracked (name, version) {
    const key = String(name) + String(version)
    if (seen.has(key)) {
      return true
    }

    seen.add(key)
  }

  function retrieveDependencies (dependencies) {
    const trailing = dependencies[_trailingDependencies]

    if (trailing) {
      return Object.assign(
        empty(),
        dependencies,
        trailing
      )
    }

    return dependencies
  }

  function hasDependencies (dependencies) {
    return dependencies && (
      Object.keys(dependencies).length ||
      dependencies[_trailingDependencies]
    )
  }

  function attachFundingInfo (target, funding) {
    if (funding && isValidFunding(funding)) {
      target.funding = normalizeFunding(funding)
      packageWithFundingCount++
    }
  }

  function getFundingDependencies (t) {
    const edges: IterableIterator<ArboristEdge>= t && t.edgesOut && t.edgesOut.values()
    if (!edges) {
      return empty()
    }

    const directDepsWithFunding = Array.from(edges).map(edge => {
      if (!edge || !edge.to) {
        return empty()
      }

      const node = edge.to.target || edge.to
      if (!node.package) {
        return empty()
      }

      const { name, funding, version } = node.package

      // avoids duplicated items within the funding tree
      if (tracked(name, version)) {
        return empty()
      }

      const fundingItem: {
        version?: string;
        funding?: any;
      } = {}

      if (version) {
        fundingItem.version = version
      }

      attachFundingInfo(fundingItem, funding)

      return {
        node,
        fundingItem,
      }
    })

    return directDepsWithFunding.reduce(
      (res, { node, fundingItem }, i) => {
        if (!fundingItem ||
          fundingItem.length === 0 ||
          !node) {
          return res
        }

        // recurse
        const transitiveDependencies = node.edgesOut &&
          node.edgesOut.size > 0 &&
          getFundingDependencies(node)

        if (hasDependencies(transitiveDependencies)) {
          fundingItem.dependencies =
            retrieveDependencies(transitiveDependencies)
        }

        if (isValidFunding(fundingItem.funding)) {
          res[node.package.name] = fundingItem
        } else if (hasDependencies(fundingItem.dependencies)) {
          res[_trailingDependencies] =
            Object.assign(
              empty(),
              res[_trailingDependencies],
              fundingItem.dependencies
            )
        }

        return res
      }, empty())
  }

  const treeDependencies = getFundingDependencies(tree)
  const result: PackageInfoResult = {
    length: packageWithFundingCount,
  }

  const name =
    (tree && tree.package && tree.package.name) ||
    (tree && tree.name)
  result.name = name || (tree && tree.path)

  if (tree && tree.package && tree.package.version) {
    result.version = tree.package.version
  }

  if (tree && tree.package && tree.package.funding) {
    result.funding = normalizeFunding(tree.package.funding)
  }

  result.dependencies = retrieveDependencies(treeDependencies)

  return result
}
