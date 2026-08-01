type CategoryRule = {
  category: string;
  keywords: string[];
};

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "工资",
    keywords: ["工资", "薪资", "salary"]
  },
  {
    category: "餐饮",
    keywords: ["餐", "咖啡", "奶茶", "美团外卖", "饿了么"]
  },
  {
    category: "交通",
    keywords: ["地铁", "公交", "滴滴", "铁路", "航空"]
  },
  {
    category: "购物",
    keywords: ["淘宝", "天猫", "京东", "拼多多", "盒马"]
  },
  {
    category: "居住",
    keywords: ["房租", "物业", "燃气", "电费", "水费"]
  },
  {
    category: "通讯",
    keywords: ["移动", "联通", "电信", "话费"]
  }
];

export function inferCategory(input: {
  category?: string;
  merchant?: string;
  note?: string;
}) {
  const explicitCategory = input.category?.trim();

  if (explicitCategory) {
    return {
      category: explicitCategory,
      source: "csv" as const
    };
  }

  const searchableText = `${input.merchant ?? ""} ${input.note ?? ""}`
    .trim()
    .toLowerCase();

  const matchedRule = CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) =>
      searchableText.includes(keyword.toLowerCase())
    )
  );

  return {
    category: matchedRule?.category ?? "未分类",
    source: matchedRule ? ("rule" as const) : ("fallback" as const)
  };
}