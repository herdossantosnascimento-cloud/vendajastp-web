export default function PaymentSentPage() {
  return (
    <main className="max-w-xl mx-auto px-6 py-16 text-center">
      <h1 className="mb-6 text-3xl font-bold">
        Pagamento enviado ✅
      </h1>

      <p className="mb-6 text-gray-600">
        Recebemos o teu comprovativo de pagamento.
      </p>

      <p className="mb-10 text-gray-600">
        A nossa equipa irá confirmar a transferência.
        Assim que o pagamento for validado, o teu plano será ativado automaticamente.
      </p>

      <p className="mb-10 text-sm text-gray-500">
        Normalmente este processo demora menos de 24 horas.
      </p>

      <div className="flex justify-center gap-4">
        <a
          href="/"
          className="rounded-lg bg-black px-6 py-3 text-white"
        >
          Voltar ao início
        </a>

        <a
          href="/"
          className="rounded-lg border px-6 py-3"
        >
          Continuar a navegar
        </a>
      </div>
    </main>
  );
}
