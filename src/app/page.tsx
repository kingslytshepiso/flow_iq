import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">FlowIQ</h1>
          <p className="text-xl md:text-2xl mb-8 text-[var(--text-secondary)]">
            Smart Cash Flow & Inventory Management
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button className="px-8 py-3 text-lg">Get Started</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="px-8 py-3 text-lg">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Cash Flow Management</h3>
            <p className="text-[var(--text-secondary)]">
              Track income and expenses, manage transactions, and get real-time
              insights into your financial health.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="text-3xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Inventory Control</h3>
            <p className="text-[var(--text-secondary)]">
              Monitor stock levels, track products, and manage orders
              efficiently with our comprehensive inventory system.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
            <p className="text-[var(--text-secondary)]">
              Get detailed reports and insights to make informed business
              decisions.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Why Choose FlowIQ?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-left">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Real-time financial tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Automated inventory management</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Multi-language support</span>
                </li>
              </ul>
            </div>
            <div className="text-left">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Secure user authentication</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Detailed reporting system</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Role-based access control</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Join FlowIQ today and take control of your business finances and
            inventory.
          </p>
          <Link href="/register">
            <Button className="px-8 py-3 text-lg">Create Free Account</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
