angular.module('products', ['ngResource'])

.factory('ProductsResource', ['$resource', function($resource) {
  return $resource('/api/products/:id', null, //{id: '@id'}
    {
        'update': { method:'PUT' }
    });
}])

.component('products', {
  template: '<h2>Products</h2><ng-outlet></ng-outlet>',
    $routeConfig: [
    {path: '/', name: 'ProductList', component: 'productList', useAsDefault: true},
    {path: '/:id', name: 'ProductDetail', component: 'productDetail' }
  ]
})

.component('productList', {
  templateUrl: 'templates/productList.html',
  bindings: { $router: '<' },
  controller: ProductListComponent
})

.component('productDetail', {
  templateUrl: 'templates/productDetail.html',
  bindings: { $router: '<' },
  controller: ProductDetailComponent
});

function ProductListComponent(ProductsResource) {
  var $ctrl = this;
  this.$routerOnActivate = function(next) {
      var products = ProductsResource.query(function() {
        $ctrl.products = products;
        selectedId = next.params.id;
      });
    };
  this.newProduct = function () {
    var product = new ProductsResource();
    product.name = "New product";
    product.price = 0;
    product.$save(function(product){
      $ctrl.$router.navigate(['ProductDetail', {id: product.id}]);
    });
  }
}

function ProductDetailComponent(ProductsResource) {
  var $ctrl = this;
  this.$routerOnActivate = function(next) {
      var id = next.params.id;
      ProductsResource.get({id: id}, function(product, getResponseHeaders) {
        $ctrl.product = product;
      });
    };
  this.save = function () {
    ProductsResource.update({id: $ctrl.product.id}, $ctrl.product);
  }
  this.gotoProducts = function () {
    var id = $ctrl.product && $ctrl.product.id;
    this.$router.navigate(['ProductList', {id: id}]);
  }
}
