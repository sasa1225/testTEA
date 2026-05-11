export const MENU_DATA = [
  {
    category: "Original TEA",
    items: [
      { id: "ot-1", name: "紅茶", nameEn: "Black Tea", priceM: 25, priceL: 30, hasHot: true },
      { id: "ot-2", name: "綠茶", nameEn: "Green Tea", priceM: 25, priceL: 30, hasHot: true },
      { id: "ot-3", name: "春烏龍", nameEn: "Spring Oolong Tea", priceM: 30, priceL: 35, hasHot: true },
      { id: "ot-4", name: "輕烏龍", nameEn: "Light Roasted Oolong Tea", priceM: 30, priceL: 35, hasHot: true },
      { id: "ot-5", name: "焙烏龍", nameEn: "Dark Roasted Oolong Tea", priceM: 30, priceL: 35, hasHot: true },
    ]
  },
  {
    category: "Classic MILK TEA",
    items: [
      { id: "mt-1", name: "奶茶", nameEn: "Milk Tea", priceM: 45, priceL: 50, hasHot: true },
      { id: "mt-2", name: "焙烏龍奶茶", nameEn: "Dark Roasted Oolong Milk Tea", priceM: 45, priceL: 50, hasHot: true },
      { id: "mt-3", name: "珍珠奶茶", nameEn: "Pearl Milk Tea", priceM: 55, priceL: 60, hasHot: true },
      { id: "mt-4", name: "黃金珍珠奶綠", nameEn: "Golden Bubble Green Milk Tea", priceM: 55, priceL: 60, hasHot: true },
      { id: "mt-5", name: "烘吉奶茶", nameEn: "Hojicha Milk Tea", priceM: 50, priceL: 50, hasHot: true },
    ]
  },
  {
    category: "Double FRUIT",
    items: [
      { id: "df-1", name: "檸檬春烏龍", nameEn: "Lemon Spring Oolong Tea", priceM: 50, priceL: 60, hasHot: true },
      { id: "df-2", name: "香橙春烏龍", nameEn: "Orange Spring Oolong Tea", priceM: 60, priceL: 70, hasHot: true },
      { id: "df-3", name: "甘蔗春烏龍", nameEn: "Sugar Cane Spring Oolong Tea", priceM: 60, priceL: 70, hasHot: true },
      { id: "df-4", name: "青梅春烏龍", nameEn: "Green Plum Spring Oolong Tea", priceM: 50, priceL: 60, hasHot: false },
      { id: "df-5", name: "優酪春烏龍", nameEn: "Yogurt Spring Oolong Tea", priceM: 55, priceL: 65, hasHot: false },
      { id: "df-6", name: "雙柚金烏龍", nameEn: "Yuzu Oolong Tea", priceM: 55, priceL: 65, hasHot: false },
    ]
  },
  {
    category: "Fresh MILK",
    items: [
      { id: "fm-1", name: "紅茶鮮奶", nameEn: "Black Tea Latte", priceM: 55, priceL: 65, hasHot: true },
      { id: "fm-2", name: "輕烏龍鮮奶", nameEn: "Light Roasted Oolong Tea Latte", priceM: 55, priceL: 65, hasHot: true },
      { id: "fm-3", name: "焙烏龍鮮奶", nameEn: "Dark Roasted Oolong Tea Latte", priceM: 55, priceL: 65, hasHot: true },
      { id: "fm-4", name: "烘吉鮮奶", nameEn: "Hojicha Latte", priceM: 70, priceL: 70, hasHot: true },
    ]
  },
  {
    category: "Cheese MILK FOAM",
    items: [
      { id: "cm-1", name: "芝士奶蓋春烏龍", nameEn: "Cheese Milk Foam Spring Oolong Tea", priceM: 50, priceL: 60, hasHot: true },
      { id: "cm-2", name: "芝士奶蓋焙烏龍", nameEn: "Cheese Milk Foam Dark Roasted Oolong Tea", priceM: 50, priceL: 60, hasHot: true },
      { id: "cm-3", name: "芝士奶蓋阿華田", nameEn: "Cheese Milk Foam Ovaltine", priceM: 55, priceL: 65, hasHot: true },
      { id: "cm-4", name: "芝士奶蓋烘吉茶", nameEn: "Cheese Milk Foam Hojicha", priceM: 55, priceL: 65, hasHot: true },
    ]
  }
];

export const TOPPINGS = [
  { name: "珍珠", price: 10 },
  { name: "黃金珍珠", price: 10 },
  { name: "焙烏龍茶凍", price: 10 },
];

export const SUGAR_LEVELS = ["正常糖", "少糖", "半糖", "微糖", "二分糖", "無糖"];
export const ICE_LEVELS = ["正常冰", "少冰", "微冰", "去冰", "完全去冰", "常溫", "熱"];
