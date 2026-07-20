import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4 font-sans selection:bg-[#E76257] selection:text-white">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-[#1C2439] tracking-tight mb-2">
            Automated SLA Risk Pipeline
          </h1>
          <p className="text-slate-600 font-medium">
            Enterprise Third-Party Risk Management
          </p>
        </div>

        <div className="w-full bg-amber-50 border border-amber-200/60 rounded-xl p-5 text-center mb-8 shadow-sm">
          <p className="text-sm font-semibold text-amber-700 mb-1.5">This is a public demo.</p>
          <p className="text-xs text-amber-700/80 mb-4 leading-relaxed">
            You can deploy your own instance to your local device or server!
          </p>
          <a
            href="https://github.com/Sejabur/Automated-SLA-Risk-Pipeline"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            View on GitHub
          </a>
        </div>

        <AuthForm message={searchParams?.message} />
      </div>
    </div>
  );
}
