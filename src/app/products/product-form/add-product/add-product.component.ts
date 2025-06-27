import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../service/product-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../core/Service/category-service/category.service';
import { CommonModule } from '@angular/common';
import { HaederComponent } from "../../../shared/haeder/haeder.component";
import { ProductRequest } from './product-create-request';
import { TokenService } from '../../../core/Service/token.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HaederComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  productId: string | null = null;
  productForm: FormGroup;
  submitted = false;
  loading = false;
  editing = false;
  images: {file: File, url: string}[] = [];

  error: string | null = null;
  success = false;

  productRequest: ProductRequest = {
    title: '',
    description: '',
    price: null,
    stock: null,
    status: '',
    categoryId: 0,
    location: ''};
  
  // Opciones del formulario
  productConditions = ['NUEVO', 'USADO'];
  categories: any[] = [];
  states: any[] = [];
  cities: any[] = [];


  //ciudades de el salvador
  state = [
    { id: 1, name: 'San Salvador' },
    { id: 2, name: 'Santa Ana' },
    { id: 3, name: 'San Miguel' },
    { id: 4, name: 'La Libertad' },
    { id: 5, name: 'Sonsonate' },
    { id: 6, name: 'Ahuachapan' },
    { id: 7, name: 'Usulutan' },
    { id: 8, name: 'Cabañas' },
    { id: 9, name: 'Chalatenango' },
    { id: 10, name: 'La Paz' }
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    // private locationService: LocationService,
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService

    
  ) {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      condition: ['', Validators.required],
      categoryId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.5)]],
      stock: ['', [Validators.required, Validators.min(1)]],
      locationDetails: ['']
    });
  }

  ngOnInit(): void {
    //verificar si el token es valido si no es valido redirigir a la pagina de home y la recarga
    if (this.tokenService.isTokenExpired()) {
      this.tokenService.removeToken();
      // this.router.navigate(['/']);
      this.router.navigate(['/']).then(() => {
        window.location.reload();
      });
    }
    
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.editing = true;
      this.loadProductData(productId);
      this.productId = productId;
    }

    // Cargar opciones del formulario
    this.loadCategories();
    // this.loadStates();

  }

  // Convenience getter for easy access to form fields
  get f() { return this.productForm.controls; }

  loadProductData(productId: string) {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
        
        // Cargar imágenes existentes
        // if (product.images) {
          // Aquí deberías adaptar según cómo manejas las imágenes existentes
          // this.images = product.images.map(img => ({url: img.url}));
        // }
      },
      error: (err) => {
        console.error('Error loading product', err);
        this.router.navigate(['/error']);
      }
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories', err);
      }
    });
  }

  // loadStates() {
  //   this.locationService.getStates().subscribe({
  //     next: (states) => {
  //       this.states = states;
  //     },
  //     error: (err) => {
  //       console.error('Error loading states', err);
  //     }
  //   });
  // }

  // onStateChange() {
  //   const stateId = this.productForm.get('state')?.value;
  //   if (stateId) {
  //     this.locationService.getCitiesByState(stateId).subscribe({
  //       next: (cities) => {
  //         this.cities = cities;
  //         this.productForm.get('city')?.reset();
  //       },
  //       error: (err) => {
  //         console.error('Error loading cities', err);
  //       }
  //     });
  //   }
  // }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (this.images.length >= 8) break;
        
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = (e: any) => {
          this.images.push({
            file: file,
            url: e.target.result
          });
        };
        
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }

  moveImageUp(index: number) {
    if (index > 0) {
      const temp = this.images[index];
      this.images[index] = this.images[index - 1];
      this.images[index - 1] = temp;
    }
  }

  onSubmit() {

    this.submitted = true;
    
    // Validar imágenes
    if (this.images.length === 0 && !this.editing) {
      return;
    }
    
    
    if (this.productForm.invalid && !this.editing) {
      return;
    }
    // console.log('Formulario enviado:', this.productForm.value);

    this.loading = true;

    const formData = new FormData();

    if (this.editing) {
    console.log('Formulario enviado:', this.productRequest);

      this.productService.updateProduct(this.productId!,this.productRequest, this.images.map(img => img.file))
      .subscribe({
        next: (product) => {
          this.success = true;
          this.loading = false;
          this.router.navigate(['/my-products']);
        },
        error: (err) => { 
          this.error = 'Error al actualizar el producto. Intenta nuevamente.';
          this.loading = false;
          console.error('Error:', err);
        }
      });
    
    } else {
     
      // Llamar al servicio para guardar
      this.productService.createProductWithImages(this.productRequest, this.images.map(img => img.file))
        .subscribe({
          next: (product) => {
            this.success = true;
            this.loading = false;
            // Aquí puedes redirigir o resetear el formulario
            this.router.navigate(['/']);
          },
          error: (err) => { 
            this.error = 'Error al guardar el producto. Intenta nuevamente.';
            this.loading = false;
            console.error('Error:', err);
            
          }
      });
    }
  }
}
