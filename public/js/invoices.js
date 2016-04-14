angular.module('invoices', ['ngResource', 'customers', 'products'])

.factory('InvoiceItemsResource', ['$resource', function($resource) {
  return $resource('/api/invoices/:invoiceId/items/:id', null, //{id: '@id'}
    {
        'update': { method:'PUT' }
    });
}])

.factory('InvoicesResource', ['$resource', function($resource) {
  return $resource('/api/invoices/:id', null, //{id: '@id'}
    {
        'update': { method:'PUT' }
    });
}])

.component('invoices', {
  template: '<h2>Invoices</h2><ng-outlet></ng-outlet>',
    $routeConfig: [
    {path: '/', name: 'InvoiceList', component: 'invoiceList', useAsDefault: true},
    {path: '/:id', name: 'InvoiceDetail', component: 'invoiceDetail' }
  ]
})

.component('invoiceList', {
  templateUrl: 'templates/invoiceList.html',
  bindings: { $router: '<' },
  controller: InvoiceListComponent
})

.component('invoiceDetail', {
  templateUrl: 'templates/invoiceDetail.html',
  bindings: { $router: '<' },
  controller: InvoiceDetailComponent
});

function InvoiceListComponent(InvoicesResource) {
  var $ctrl = this;
  this.$routerOnActivate = function(next) {
      var invoices = InvoicesResource.query(function() {
        $ctrl.invoices = invoices;
        selectedId = next.params.id;
      });
    };
  this.newInvoice = function () {
    var invoice = new InvoicesResource();
    invoice.name = "New invoice";
    invoice.customer_id = 1; // dirty hack
    invoice.price = 0;
    invoice.$save(function(invoice){
      $ctrl.$router.navigate(['InvoiceDetail', {id: invoice.id}]);
    });
  }
}

function InvoiceDetailComponent(InvoicesResource, CustomersResource, ProductsResource, InvoiceItemsResource, $location) {
  var $ctrl = this;
  this.$routerOnActivate = function(next) {
      var id = next.params.id;
      var products = ProductsResource.query(function () {
        $ctrl.products = products;
      });
      var items = InvoiceItemsResource.query({invoiceId: id},function () {
        $ctrl.items = items
        angular.forEach(items, function (item) {
          item.product_id = item.product_id.toString();
        });
      });
      var customers = CustomersResource.query(function () {
        $ctrl.customers = customers;
      });
      InvoicesResource.get({id: id}, function(invoice, getResponseHeaders) {
        invoice.customer_id = invoice.customer_id.toString();
        $ctrl.invoice = invoice;
      });
    };

  this.save = function () {
    InvoicesResource.update({id: $ctrl.invoice.id}, $ctrl.invoice);
  }

  this.addItem = function () {
    var item = new InvoiceItemsResource();
    item.product_id = this.products[0].id;
    item.quantity = 1;
    item.invoice_id = this.invoice.id;
    InvoiceItemsResource.save({invoiceId: this.invoice.id}, item, function (item) {
      item.product_id = item.product_id.toString();
      $ctrl.items.push(item);
    })
  }

  this.deleteItem = function (item) {
    InvoiceItemsResource.delete({id: item.id, invoiceId: item.invoice_id});
    i = $ctrl.items.indexOf(item);
    $ctrl.items.splice(i, 1);
  }

  this.saveItem = function (item) {
    InvoiceItemsResource.update({id: item.id, invoiceId: item.invoice_id}, item);
  }

  this.gotoInvoices = function () {
    var id = $ctrl.invoice && $ctrl.invoice.id;
    this.$router.navigate(['InvoiceList', {id: id}]);
  }

  this.newCustomer = function () {
    var customer = new CustomersResource();
    customer.name = "New customer";
    customer.price = 0;
    customer.$save(function(customer){
      $location.path("/customers/"+customer.id); //dirty
    });
  }

  this.newProduct = function () {
    var product = new ProductsResource();
    product.name = "New product";
    product.price = 0;
    product.$save(function(product){
      $location.path("/products/"+product.id); //dirty
    });
  }

}
