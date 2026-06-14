import type { Account } from "@/types/finance";

export const featureCards = [
    {
      href: "/chat",
      kicker: "Chat",
      title: "AI 财务对话",
      description: "用自然语言提出问题，后续由 AI 解析意图并调用确定性计算。"
    },
    {
      href: "/dashboard",
      kicker: "Dashboard",
      title: "财务仪表盘",
      description: "查看账户、收入、支出、结余和储蓄率等核心指标。"
    },
    {
      href: "/scenarios",
      kicker: "Scenarios",
      title: "场景模拟",
      description: "模拟买车、提前还贷、储蓄目标变化对现金流的影响。"
    },
    {
      href: "/import",
      kicker: "Import",
      title: "CSV 导入",
      description: "后续用于导入银行、支付宝和微信账单。"
    }
  ];
  
  export const summaryCards = [
    { label: "月收入", value: "30,000 元", description: "工资和其他固定收入" },
    { label: "月支出", value: "18,000 元", description: "固定支出和日常消费" },
    { label: "月结余", value: "12,000 元", description: "可用于储蓄和投资" },
    { label: "储蓄率", value: "40%", description: "月结余 / 月收入" }
  ];
  
  export const recentTransactions = [
    { id: "tx_001", title: "工资收入", category: "收入", amount: "+30,000 元" },
    { id: "tx_002", title: "房租", category: "居住", amount: "-6,000 元" },
    { id: "tx_003", title: "餐饮", category: "日常消费", amount: "-1,200 元" }
  ];
  
  export const scenarioCards = [
    {
      title: "两年内攒够 50 万",
      description: "根据当前月结余和初始储蓄，估算目标是否可达。"
    },
    {
      title: "提前还贷 10 万",
      description: "比较提前还贷后利息节省和现金流压力变化。"
    },
    {
      title: "每月多支出 2,000 元",
      description: "观察长期储蓄目标和安全垫会受到什么影响。"
    }
  ];
  
  export const importSteps = [
    "上传 CSV 文件",
    "预览并确认字段",
    "自动识别收支分类",
    "保存为本地流水"
  ];
  
  export const chatExamples = [
    "我两年内能攒够 50 万吗？",
    "如果我每月多花 2000 元，会影响储蓄目标吗？",
    "信用卡应该优先还哪一张？"
  ];

  export const initialAccounts: Account[] = [
    {
      id: "account_001",
      name: "工资卡",
      type: "bank",
      balance: 20000
    },
    {
      id: "account_002",
      name: "现金",
      type: "cash",
      balance: 1000
    },
    {
      id: "account_003",
      name: "信用卡",
      type: "credit",
      balance: -3500
    }
  ];