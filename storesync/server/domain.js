export function normalizeOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Add at least one item to the cart.')
  }

  const seen = new Set()
  return items.map((item) => {
    const productId = String(item?.productId ?? '').trim()
    const quantity = Number(item?.quantity)
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      throw new Error('Each cart item needs a product and a quantity from 1 to 50.')
    }
    if (seen.has(productId)) throw new Error('Each product can appear only once in the cart.')
    seen.add(productId)
    return { productId, quantity }
  })
}

export function buildProductSearchQuery({ query, category, city, maxPrice }) {
  const must = query
    ? [{
        multi_match: {
          query,
          fields: ['name^3', 'subtitle^2', 'category', 'description'],
          fuzziness: 'AUTO',
          prefix_length: 1,
        },
      }]
    : [{ match_all: {} }]

  const filter = []
  if (category && category !== 'All finds') filter.push({ term: { category } })
  if (city && city !== 'All cities') filter.push({ term: { cities: city } })
  if (Number.isFinite(maxPrice)) filter.push({ range: { price: { lte: maxPrice } } })

  return { bool: { must, filter } }
}
