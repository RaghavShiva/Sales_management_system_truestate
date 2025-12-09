import Sale from "../models/Sale.js";

function toArray(val) {
  if (!val) return [];
  return String(val)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export async function getSales(query) {
  const {
    search = "",
    regions,
    genders,
    ageMin,
    ageMax,
    categories,
    tags,
    paymentMethods,
    startDate,
    endDate,
    sortBy = "date",
    sortOrder = "desc",
    page = 1
  } = query;

  const LIMIT = 10;
  const filter = {};

  // search by name or phone
  const term = String(search || "").trim();
  if (term) {
    try {
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(esc, "i");
      filter.$or = [
        { customerName: { $exists: true, $regex: rx } },
        { phoneNumber: { $exists: true, $regex: rx } }
      ];
    } catch (e) {
      filter.$or = [{ customerName: term }, { phoneNumber: term }];
    }
  }

  const regionArr = toArray(regions);
  const genderArr = toArray(genders);
  const categoryArr = toArray(categories);
  const tagArr = toArray(tags);
  const paymentArr = toArray(paymentMethods);

  if (regionArr.length) filter.customerRegion = { $in: regionArr };
  if (genderArr.length) filter.gender = { $in: genderArr };
  if (categoryArr.length) filter.productCategory = { $in: categoryArr };
  if (paymentArr.length) filter.paymentMethod = { $in: paymentArr };
  if (tagArr.length) filter.tags = { $in: tagArr };

  const minA = ageMin ? Number(ageMin) : null;
  const maxA = ageMax ? Number(ageMax) : null;
  if (minA !== null && !isNaN(minA) && minA >= 0) {
    if (!filter.age) filter.age = {};
    filter.age.$gte = minA;
  }
  if (maxA !== null && !isNaN(maxA) && maxA >= 0) {
    if (!filter.age) filter.age = {};
    filter.age.$lte = maxA;
  }

  if (
    minA !== null &&
    maxA !== null &&
    !isNaN(minA) &&
    !isNaN(maxA) &&
    minA > maxA
  ) {
    return {
      data: [],
      meta: { page: 1, pageSize: LIMIT, totalItems: 0, totalPages: 1 },
      summary: { totalUnits: 0, totalAmount: 0, totalDiscount: 0 }
    };
  }

  if (startDate || endDate) {
    const s = startDate ? new Date(startDate) : null;
    const e = endDate ? new Date(endDate) : null;

    if (s && isNaN(s.getTime())) {
      return {
        data: [],
        meta: { page: 1, pageSize: LIMIT, totalItems: 0, totalPages: 1 },
        summary: { totalUnits: 0, totalAmount: 0, totalDiscount: 0 }
      };
    }
    if (e && isNaN(e.getTime())) {
      return {
        data: [],
        meta: { page: 1, pageSize: LIMIT, totalItems: 0, totalPages: 1 },
        summary: { totalUnits: 0, totalAmount: 0, totalDiscount: 0 }
      };
    }

    if (s && e && s > e) {
      return {
        data: [],
        meta: { page: 1, pageSize: LIMIT, totalItems: 0, totalPages: 1 },
        summary: { totalUnits: 0, totalAmount: 0, totalDiscount: 0 }
      };
    }

    if (s || e) {
      filter.date = {};
      if (s) {
        s.setHours(0, 0, 0, 0);
        filter.date.$gte = s;
      }
      if (e) {
        e.setHours(23, 59, 59, 999);
        filter.date.$lte = e;
      }
    }
  }

  const fieldMap = {
    date: "date",
    quantity: "quantity",
    customerName: "customerName"
  };
  const sortField = fieldMap[sortBy] || "date";
  const order = sortOrder === "asc" ? 1 : -1;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (pageNum - 1) * LIMIT;

  // Query rows, count and aggregated summary in parallel
  const [items, totalCount, agg] = await Promise.all([
    Sale.find(filter)
      .sort({ [sortField]: order })
      .skip(offset)
      .limit(LIMIT),
    Sale.countDocuments(filter),
    Sale.aggregate([
      { $match: filter },
      {
        $project: {
          quantity: { $ifNull: ["$quantity", 0] },
          totalAmount: { $ifNull: ["$totalAmount", 0] },
          finalAmount: { $ifNull: ["$finalAmount", 0] }
        }
      },
      {
        $group: {
          _id: null,
          totalUnits: { $sum: "$quantity" },
          totalAmount: { $sum: "$finalAmount" },
          totalDiscount: { $sum: { $subtract: ["$totalAmount", "$finalAmount"] } }
        }
      }
    ])
  ]);

  const resultSummary = agg[0] || {
    totalUnits: 0,
    totalAmount: 0,
    totalDiscount: 0
  };

  return {
    data: items,
    meta: {
      page: pageNum,
      pageSize: LIMIT,
      totalItems: totalCount,
      totalPages: Math.max(Math.ceil(totalCount / LIMIT), 1)
    },
    summary: {
      totalUnits: resultSummary.totalUnits,
      totalAmount: resultSummary.totalAmount,
      totalDiscount: resultSummary.totalDiscount
    }
  };
}
