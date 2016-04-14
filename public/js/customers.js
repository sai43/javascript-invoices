angular.module('customers', ['ngResource'])

.factory('CustomersResource', ['$resource', function($resource) {
  return $resource('/api/customers/:id', null, //{id: '@id'}
    {
        'update': { method:'PUT' }
    });
}])

.component('customers', {
  template: '<h2>Customers</h2><ng-outlet></ng-outlet>',
    $routeConfig: [
    {path: '/', name: 'CustomerList', component: 'customerList', useAsDefault: true},
    {path: '/:id', name: 'CustomerDetail', component: 'customerDetail' }
  ]
})

.component('customerList', {
  templateUrl: 'templates/customerList.html',
  bindings: { $router: '<' },
  controller: CustomerListComponent
})

.component('customerDetail', {
  templateUrl: 'templates/customerDetail.html',
  bindings: { $router: '<' },
  controller: CustomerDetailComponent
});

function CustomerListComponent(CustomersResource) {
  var $ctrl = this;
  this.$routerOnActivate = function(next) {
      var customers = CustomersResource.query(function() {
        $ctrl.customers = customers;
        selectedId = next.params.id;
      });
    };
  this.newCustomer = function () {
    var customer = new CustomersResource();
    customer.name = "New customer";
    customer.price = 0;
    customer.$save(function(customer){
      $ctrl.$router.navigate(['CustomerDetail', {id: customer.id}]);
    });
  }
}

function CustomerDetailComponent(CustomersResource) {
  var $ctrl = this;
  this.$routerOnActivate = function(next) {
      var id = next.params.id;
      CustomersResource.get({id: id}, function(customer, getResponseHeaders) {
        $ctrl.customer = customer;
      });
    };
  this.save = function () {
    CustomersResource.update({id: $ctrl.customer.id}, $ctrl.customer);
  }
  this.gotoCustomers = function () {
    var id = $ctrl.customer && $ctrl.customer.id;
    this.$router.navigate(['CustomerList', {id: id}]);
  }
}
