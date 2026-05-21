export async function paginate(model, query, { page = 1, limit = 20, sort = { createdAt: -1 }, populate = [] } = {}) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    model.find(query).sort(sort).skip(skip).limit(limitNum).populate(populate),
    model.countDocuments(query),
  ]);

  return {
    data,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}
