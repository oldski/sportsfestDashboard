'use client';

import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';

import {
  getAllCouponsSimple,
  getActiveCouponsSimple,
  getExpiredCouponsSimple,
  getUsedCouponsSimple,
  type CouponData
} from '~/actions/admin/get-coupons-simple';
import { CouponDataTable } from '~/components/admin/event-registration/coupon-data-table';
import CouponManagementTableLoading
  from "~/app/admin/(admin)/event-registration/coupons/@couponManagementTable/loading";

export default function CouponManagementTablePage(): React.JSX.Element {
  const [allCoupons, setAllCoupons] = React.useState<CouponData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchCoupons = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const coupons = await getAllCouponsSimple();
      setAllCoupons(coupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  if (isLoading) {
    return (
      <CouponManagementTableLoading />
    );
  }

  return (
    <CouponDataTable data={allCoupons} onDataChange={fetchCoupons} />
  );
}
