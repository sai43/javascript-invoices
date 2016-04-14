angular.module('app', ['ngComponentRouter', 'invoices', 'products', 'customers'])

.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
})

.value('$routerRootComponent', 'app')

.component('app', {
  templateUrl: '/templates/app.html',
  $routeConfig: [
    {path: '/invoices/...', name: 'Invoices', component: 'invoices', useAsDefault: true},
    {path: '/customers/...', name: 'Customers', component: 'customers' },
    {path: '/products/...', name: 'Products', component: 'products' }
  ]
});
