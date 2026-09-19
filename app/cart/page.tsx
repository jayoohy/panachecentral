import { CartView } from "@/components/commerce/CartView";
import { PageHeading } from "@/components/shared/PageHeading";

export const metadata = { title: "Your Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
      <PageHeading>Your Cart</PageHeading>
      <div className="mt-8 min-h-[50vh]">
        <CartView />
      </div>
    </div>
  );
}
