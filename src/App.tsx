import { useEffect, useMemo, useState } from "react";

type Despesa = {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
};

type FormState = {
  descricao: string;
  valor: string;
  categoria: string;
  data: string;
};

const API_URL = "http://localhost:8081/despesas";

const categoriasSugestao = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Outros",
];

export default function WayneFinance() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("");
  const [form, setForm] = useState<FormState>({
    descricao: "",
    valor: "",
    categoria: "Alimentação",
    data: "",
  });

  async function carregarDespesas() {
    try {
      setLoading(true);
      setErro("");
      setMensagem("🦇 Sincronizando dados com o Batcomputador...");

      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Não foi possível buscar as despesas.");
      }

      const data: Despesa[] = await response.json();
      setDespesas(data);
      setMensagem("");
    } catch (error) {
      console.error(error);
      setErro(
        "Erro ao carregar despesas. Verifique se a API está rodando em http://localhost:8081/despesas"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDespesas();
  }, []);

  function atualizarCampo<K extends keyof FormState>(
    campo: K,
    valor: FormState[K]
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function cadastrarDespesa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setErro("");
      setMensagem("🦇 Registrando nova operação em Gotham...");

      const payload = {
        descricao: form.descricao.trim(),
        valor: Number(form.valor),
        categoria: form.categoria.trim(),
        data: form.data,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Não foi possível cadastrar a despesa.");
      }

      setForm({
        descricao: "",
        valor: "",
        categoria: "Alimentação",
        data: "",
      });

      setMensagem("✅ Despesa cadastrada com sucesso.");
      await carregarDespesas();
    } catch (error) {
      console.error(error);
      setErro("Erro ao cadastrar despesa.");
    }
  }

  async function excluirDespesa(id: number) {
    try {
      setErro("");
      setMensagem("🦇 Excluindo registro dos arquivos da Batcaverna...");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Não foi possível excluir a despesa.");
      }

      setMensagem("✅ Despesa excluída com sucesso.");
      await carregarDespesas();
    } catch (error) {
      console.error(error);
      setErro("Erro ao excluir despesa.");
    }
  }

  const despesasFiltradas = useMemo(() => {
    const termo = filtro.trim().toLowerCase();

    return despesas.filter((d) => {
      const bateTexto =
        !termo ||
        d.descricao.toLowerCase().includes(termo) ||
        d.categoria.toLowerCase().includes(termo);

      return bateTexto;
    });
  }, [despesas, filtro]);

  const totalGeral = useMemo(() => {
    return despesas.reduce((acc, item) => acc + Number(item.valor), 0);
  }, [despesas]);

  const totalFiltrado = useMemo(() => {
    return despesasFiltradas.reduce((acc, item) => acc + Number(item.valor), 0);
  }, [despesasFiltradas]);

  const maiorDespesa = useMemo(() => {
    if (!despesasFiltradas.length) return null;
    return despesasFiltradas.reduce((maior, atual) =>
      Number(atual.valor) > Number(maior.valor) ? atual : maior
    );
  }, [despesasFiltradas]);

  const resumoPorCategoria = useMemo(() => {
    const mapa = new Map<string, number>();

    despesasFiltradas.forEach((item) => {
      mapa.set(item.categoria, (mapa.get(item.categoria) ?? 0) + Number(item.valor));
    });

    return Array.from(mapa.entries())
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);
  }, [despesasFiltradas]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.12),_transparent_30%),linear-gradient(to_bottom_right,_#020617,_#000000,_#111827)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[28px] border border-yellow-500/20 bg-slate-950/80 p-6 shadow-2xl backdrop-blur">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-yellow-400 text-3xl text-black shadow-lg shadow-yellow-500/25">
                🦇
              </div>

              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.35em] text-yellow-300/70">
                  Wayne Enterprises
                </p>
                <h1 className="text-3xl font-black tracking-wide text-yellow-400 sm:text-4xl">
                  Batman Financias 
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Painel de controle de despesas Pessoais
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatusPill label="API" value={loading ? "Sync" : "Online"} />
              <StatusPill label="Registros" value={String(despesas.length)} />
              <StatusPill
                label="Busca"
                value={filtro ? "Ativa" : "Livre"}
              />
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ResumoCard
            titulo="Total geral"
            valor={formatarMoeda(totalGeral)}
            detalhe="Somando todas as despesas cadastradas"
          />
          <ResumoCard
            titulo="Total filtrado"
            valor={formatarMoeda(totalFiltrado)}
            detalhe="Resultado com a busca atual"
          />
          <ResumoCard
            titulo="Maior despesa"
            valor={maiorDespesa ? formatarMoeda(maiorDespesa.valor) : "R$ 0,00"}
            detalhe={maiorDespesa ? maiorDespesa.descricao : "Sem registros"}
          />
          <ResumoCard
            titulo="Categorias"
            valor={String(resumoPorCategoria.length)}
            detalhe="Categorias presentes na listagem"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-[28px] border border-yellow-500/20 bg-slate-950/80 p-6 shadow-2xl backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-yellow-400">Nova despesa</h2>
                  <p className="text-sm text-slate-400">
                    Registre uma nova movimentação
                  </p>
                </div>

                <div className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                  Operação
                </div>
              </div>

              <form onSubmit={cadastrarDespesa} className="space-y-4">
                <Campo
                  label="Descrição"
                  value={form.descricao}
                  placeholder="Ex: Mercado"
                  onChange={(value) => atualizarCampo("descricao", value)}
                />

                <Campo
                  label="Valor"
                  type="number"
                  value={form.valor}
                  placeholder="Ex: 150.50"
                  onChange={(value) => atualizarCampo("valor", value)}
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-yellow-300">
                    Categoria
                  </span>
                  <select
                    value={form.categoria}
                    onChange={(e) => atualizarCampo("categoria", e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                  >
                    {categoriasSugestao.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </label>

                <Campo
                  label="Data"
                  type="date"
                  value={form.data}
                  onChange={(value) => atualizarCampo("data", value)}
                />

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-4 py-3 font-black text-black transition hover:scale-[1.01] hover:shadow-lg hover:shadow-yellow-500/20"
                >
                  Adicionar despesa
                </button>
              </form>
            </div>

            <div className="rounded-[28px] border border-yellow-500/20 bg-slate-950/80 p-6 shadow-2xl backdrop-blur">
              <h2 className="mb-4 text-xl font-bold text-yellow-400">
                Radar por categoria
              </h2>

              <div className="space-y-4">
                {resumoPorCategoria.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Ainda não há dados para análise.
                  </p>
                ) : (
                  resumoPorCategoria.slice(0, 5).map((item) => {
                    const percentual =
                      totalFiltrado > 0 ? (item.total / totalFiltrado) * 100 : 0;

                    return (
                      <div key={item.categoria}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-200">
                            {item.categoria}
                          </span>
                          <span className="text-yellow-300">
                            {formatarMoeda(item.total)}
                          </span>
                        </div>

                        <div className="h-2 rounded-full bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500"
                            style={{ width: `${Math.min(percentual, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          <main className="rounded-[28px] border border-yellow-500/20 bg-slate-950/80 p-6 shadow-2xl backdrop-blur">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  Painel de despesas
                </h2>
                <p className="text-sm text-slate-400">
                  Pesquise, acompanhe e gerencie todos os registros.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Buscar descrição ou categoria"
                  className="rounded-2xl border border-slate-700 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400 sm:min-w-64"
                />

              </div>
            </div>

            {!!mensagem && (
              <p className="mb-3 rounded-2xl border border-yellow-500/10 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-300">
                {mensagem}
              </p>
            )}

            {!!erro && (
              <p className="mb-3 rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                {erro}
              </p>
            )}

            <div className="grid gap-4">
              {despesasFiltradas.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-yellow-500/20 bg-black/20 px-6 py-12 text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    🦇 Gotham está em ordem
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Nenhuma despesa encontrada com a busca atual.
                  </p>
                </div>
              ) : (
                despesasFiltradas.map((despesa) => (
                  <article
                    key={despesa.id}
                    className="group relative overflow-hidden rounded-[24px] border border-yellow-500/15 bg-gradient-to-br from-slate-900 via-black to-slate-950 p-5 shadow-lg transition hover:-translate-y-0.5 hover:border-yellow-400/30"
                  >
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-yellow-400/5 blur-2xl transition group-hover:bg-yellow-400/10" />

                    <div className="relative">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-xl font-black text-yellow-400">
                            {despesa.descricao}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            Registro monitorado pelo sistema Wayne Finance
                          </p>
                        </div>

                        <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-300">
                          {despesa.categoria}
                        </span>
                      </div>

                      <div className="grid gap-3 text-sm sm:grid-cols-3">
                        <Info label="Valor" value={formatarMoeda(despesa.valor)} />
                        <Info label="Data" value={formatarData(despesa.data)} />
                        <Info label="ID" value={`#${despesa.id}`} />
                      </div>

                      <button
                        type="button"
                        onClick={() => excluirDespesa(despesa.id)}
                        className="mt-5 w-full rounded-2xl bg-red-700 px-4 py-3 font-bold text-white transition hover:bg-red-600"
                      >
                        Excluir registro
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-yellow-300">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-2xl border border-slate-700 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
      />
    </label>
  );
}

function ResumoCard({
  titulo,
  valor,
  detalhe,
}: {
  titulo: string;
  valor: string;
  detalhe: string;
}) {
  return (
    <div className="rounded-[24px] border border-yellow-500/20 bg-slate-950/80 p-5 shadow-xl backdrop-blur">
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-2 text-3xl font-black text-yellow-400">{valor}</p>
      <p className="mt-2 text-sm text-slate-500">{detalhe}</p>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-black/30 px-4 py-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-yellow-300">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function formatarMoeda(valor: number) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data: string) {
  if (!data) return "Não informada";
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}