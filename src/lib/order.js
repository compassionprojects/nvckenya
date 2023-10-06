import { isAfrica } from './countries';

// changes based on the 2nd argument
//  activeTier: {
//    date: 2023-10-25,
//    title: Early bird,
//    price: "1699",
//    start_date: 2023-10-02,
//    end_date: 2023-10-25,
//    parity_price: "500",
//    price_accommodation: "380",
//    displayDate: '...',
//    isActive: true,
//  }

export function createOrderItems(
  activeTier,
  {
    country,
    cannot_pay,
    price_slided,
    need_accommodation,
    can_donate,
    donation_amount,
  },
) {
  const items = [];

  // 1) append tuition fee based on parity pricing
  const _isAfrica = isAfrica(country);
  let tuitionPrice = activeTier[_isAfrica ? 'parity_price' : 'price'];
  // if african country, consider slided price
  if (_isAfrica && cannot_pay) {
    tuitionPrice = price_slided;
  }
  items.push({
    name: `Tuition fee - ${activeTier.title}`,
    amount: parseInt(tuitionPrice, 10),
  });

  // 2) if opted for accommodation append that
  if (need_accommodation) {
    items.push({
      name: 'Accommodation fee',
      amount: parseInt(activeTier.price_accommodation, 10),
    });
  }

  // 3) if opted for donating to scholarship funds, append that
  const donationAmount = parseInt(donation_amount, 10);
  if (can_donate && donationAmount > 0) {
    items.push({
      name: 'Donation to scholarship funds',
      amount: donationAmount,
    });
  }

  return items;
}
