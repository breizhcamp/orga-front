<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <slot name="header" />
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <slot name="body" />
      </tbody>
    </table>
  </div>
</template>
