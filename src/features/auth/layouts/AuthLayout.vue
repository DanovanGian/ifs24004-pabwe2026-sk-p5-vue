<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <div
      class="hidden flex-col justify-center bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-white lg:flex"
      data-testid="auth-banner"
    >
      <h1 class="text-4xl font-extrabold">Delcom Auction</h1>
      <p class="mt-3 max-w-md text-indigo-100">
        Pasang lelang, ajukan tawaran, dan menangkan barang impianmu.
      </p>
    </div>

    <div class="flex items-center justify-center p-6">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <RouterView />
      </div>
    </div>
  </div>
</template>
