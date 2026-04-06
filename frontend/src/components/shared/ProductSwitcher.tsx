import { useAgentStore } from '@/store/agentStore';
import { PRODUCTS } from '@/constants/products';

export default function ProductSwitcher() {
  const { activeProduct, setActiveProduct } = useAgentStore();

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {Object.values(PRODUCTS).map((p) => (
        <button
          key={p.id}
          onClick={() => setActiveProduct(p.id as 'cookieyes' | 'product-b')}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            activeProduct === p.id
              ? 'text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          style={activeProduct === p.id ? { backgroundColor: p.color } : {}}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
