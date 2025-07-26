import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../service/product-service.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HaederComponent } from "../../shared/haeder/haeder.component";
import { Product } from '../../core/model/product.model';
import { TokenService } from '../../core/Service/token.service';
import { SalesProductService } from '../service/sales-product.service';
import { AuthService } from '../../auth/service/auth.service';
import { MessageService } from '../../core/Service/message-service/message.service';
import { RatingService } from '../../core/Service/rating-service/rating.service';
import { FooterComponent } from "../../shared/footer/footer.component";

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HaederComponent, FormsModule, FooterComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  // product: Product | null = null;
  productId: string | null = null;
  product: any;
  relatedProducts: any[] = [];
  selectedImage: string | null = null;
  quantity: number = 1;
  isAuthenticated = false;

  commentForm: FormGroup;

  canLeaveReview = false;




  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private _tokenService: TokenService,
    private _router: Router,
    private saleService: SalesProductService,
    private _mesagingService: MessageService,
    private fb: FormBuilder,
    private _ratingService: RatingService,
    ) { 
      this.commentForm = this.fb.group({
        comment: ['', [Validators.required, Validators.minLength(10)]],
        rating: [0, [Validators.required, Validators.min(1)]],
      });

     
    }

  ngOnInit(): void {
     // Verificar si el token está presente y no ha expirado
    if (this._tokenService.isTokenExpired()) {
      this._tokenService.removeToken();
    }
 
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      this.loadProductDetails(this.productId!);
    });

    // Verificar si el usuario está autenticado
    this.isAuthenticated = this._tokenService.existsToken();

    this.loadComments(this.productId ? parseInt(this.productId) : 0);
    
  }

  loadComments(productId: number): void {
    this._ratingService.getReputations(productId).subscribe({
      next: (comments) => {
        this.product.comments = comments; // Asignar los comentarios al producto
        console.log('Comentarios cargados:', this.product);
      },
      error: (err) => {
        console.error('Error al cargar comentarios:', err);
      }
    });
  }

  loadProductDetails(productId: string): void {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.loadRelatedProducts(this.product.category.id); // Asumiendo que el producto tiene una propiedad categoryId
        console.log('Producto cargadodd:', this.product.id);
      },
      error: (err) => {
      }
    });

  
  }

  //Metodo para cargar productos relacionados de la misma categoria
  loadRelatedProducts(categoryId: string): void {
    this.productService.getProductsByCategory(categoryId).subscribe({
      next: (products) => {
        this.relatedProducts = products.slice(0, 4); // Limitar a 4 productos relacionados
      },
      error: (err) => {
      }
    });
  }

  // Method to save purchase data
  buyNow(product: any, quantity: number): void {
    // Implement the buy now functionality here

    // Verificar si el token está presente y no ha expirado
    if (this._tokenService.isTokenExpired()) {
      this._tokenService.removeToken();
      this._router.navigate(['/login']);
      return;
    }

    // Validar la cantidad
    if (quantity <= 0) {
      console.error('Cantidad no válida. Debe ser mayor que 0.');
      return;
    }

    // Crear un objeto de compra
    const purchaseData = {
      productId: product.id,
      amount: quantity,
      total: product.price * quantity,
      userId: product.user
    };
    console.log('Producto seleccionado:', purchaseData);

    // Llamar al servicio para registrar la compra
    this.saleService.registerSale(purchaseData).subscribe({
      next: (response) => {
        // Manejar la respuesta exitosa, por ejemplo, mostrar un mensaje de éxito
        console.log('Compra registrada con éxito:', response);
        this._router.navigate(['/purchases']);
      },
      error: (error) => {
        // Manejar errores, por ejemplo, mostrar un mensaje de error
        console.error('Error al registrar la compra:', error);
      }
    });
  }
  goToProductDetails(productId: number): void {
    // Navega a este mismo componente con el ID del producto
    // Esto actualizará la URL y recargará los detalles del producto
    

    this._router.navigate(['product', productId]);
     window.scrollTo(0, 0);

  }

  // Método para iniciar una nueva conversación
  startNewConversation() {
    const sellerId = this.product.user; 
    
    this._mesagingService.startNewConversation(sellerId);
    this._router.navigate(['/messages']); // Navega al componente de mensajes
  }

  // Método para enviar un comentario
  submitComment() {
    console.log("Este es el producto: "+this.product)
    if (this.commentForm.valid) {
      console.log("Entro")
      // Lógica para enviar el comentario
      const commentData = {
        productId: this.product.id,
        comment: this.commentForm.value.comment,
        rating: this.commentForm.value.rating
      };
      console.log('Comentario enviado:', commentData);
      this._ratingService.createReputation(commentData).subscribe({
        next: (response) => {
          console.log('Comentario creado con éxito:', response);
          // Aquí podrías actualizar la lista de comentarios si es necesario
        },
        error: (error) => {
          console.error('Error al crear el comentario:', error);
        }
      });
      this.loadComments(this.product.id);
      this.commentForm.reset();
    }
  }

  // startConversationWithSeller() {
  //   if (this.product && this.product.seller) {
  //     this._mesagingService.startNewConversation(
  //       this.product.id,
  //       this.product.seller.id
  //     );
  //     this.router.navigate(['/messages']);
  //   }
  // }

  showReplyForm(comment: any) {
    // Lógica para mostrar formulario de respuesta
    console.log('Respondiendo a:', comment);
  }

  setRating(rating: number) {
    this.commentForm.get('rating')?.setValue(rating);
  }

  

  navigateToLogin() {
    this._router.navigate(['/login'], { 
      queryParams: { returnUrl: this._router.url }
    });
  }

  getRatingPercentage(rating: number): number {
    if (!this.product?.ratingCounts || !this.product.totalRatings) return 0;
    const count = this.product.ratingCounts[rating - 1] || 0;
    return (count / this.product.totalRatings) * 100;
  }
  
}
