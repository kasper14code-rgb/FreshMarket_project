from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q, Avg, Count
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
import uuid

from .models import Product, Category, Cart, CartItem, Order, OrderItem, ProductReview, ContactMessage
from .forms import ProductReviewForm, ContactForm, CheckoutForm

# Helper function
def get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(user=request.user)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        cart, created = Cart.objects.get_or_create(session_key=session_key)
    return cart

# HOME PAGE - Featured products and reviews
def home(request):
    featured_products = Product.objects.filter(is_featured=True, is_active=True)[:8]
    bestsellers = Product.objects.filter(is_bestseller=True, is_active=True)[:6]
    categories = Category.objects.filter(is_active=True)[:4]
    
    # Get recent reviews with ratings
    recent_reviews = ProductReview.objects.select_related('user', 'product').order_by('-created_at')[:6]
    
    context = {
        'featured_products': featured_products,
        'bestsellers': bestsellers,
        'categories': categories,
        'recent_reviews': recent_reviews,
    }
    return render(request, 'home.html', context)

# LISTING PAGE - All products with filtering
def shop(request):
    products = Product.objects.filter(is_active=True)
    
    # Filtering
    category_slug = request.GET.get('category')
    search_query = request.GET.get('search')
    sort_by = request.GET.get('sort', 'name')
    
    if category_slug:
        products = products.filter(category__slug=category_slug)
    
    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) | 
            Q(description__icontains=search_query)
        )
    
    # Sorting
    if sort_by == 'price_low':
        products = products.order_by('price')
    elif sort_by == 'price_high':
        products = products.order_by('-price')
    elif sort_by == 'newest':
        products = products.order_by('-created_at')
    else:
        products = products.order_by('name')
    
    # Pagination
    paginator = Paginator(products, 12)
    page_number = request.GET.get('page')
    products_page = paginator.get_page(page_number)
    
    categories = Category.objects.filter(is_active=True)
    
    context = {
        'products': products_page,
        'categories': categories,
        'current_category': category_slug,
        'search_query': search_query,
        'sort_by': sort_by,
    }
    return render(request, 'shop.html', context)

# SINGLE ITEM PAGE - Product detail with review form
def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug, is_active=True)
    
    # Get reviews
    reviews = product.reviews.select_related('user').order_by('-created_at')
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
    
    # Handle review form submission
    if request.method == 'POST' and request.user.is_authenticated:
        form = ProductReviewForm(request.POST)
        if form.is_valid():
            review, created = ProductReview.objects.update_or_create(
                product=product,
                user=request.user,
                defaults={
                    'rating': form.cleaned_data['rating'],
                    'comment': form.cleaned_data['comment']
                }
            )
            messages.success(request, 'Your review has been submitted!')
            return redirect('freshmart:product_detail', slug=slug)
    else:
        # Pre-fill form if user already reviewed
        user_review = None
        if request.user.is_authenticated:
            try:
                user_review = ProductReview.objects.get(product=product, user=request.user)
                form = ProductReviewForm(instance=user_review)
            except ProductReview.DoesNotExist:
                form = ProductReviewForm()
        else:
            form = ProductReviewForm()
    
    # Related products
    related_products = Product.objects.filter(
        category=product.category,
        is_active=True
    ).exclude(id=product.id)[:4]
    
    context = {
        'product': product,
        'reviews': reviews,
        'avg_rating': round(avg_rating, 1),
        'review_count': reviews.count(),
        'form': form,
        'related_products': related_products,
    }
    return render(request, 'product_detail.html', context)

# CONTACT PAGE - Functional contact form
def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            contact_message = form.save()
            
            # Send email to admin
            try:
                send_mail(
                    subject=f'New Contact Message: {contact_message.subject}',
                    message=f"""
                    Name: {contact_message.name}
                    Email: {contact_message.email}
                    
                    Message:
                    {contact_message.message}
                    """,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.ADMIN_EMAIL],
                    fail_silently=True,
                )
            except:
                pass  # Continue even if email fails
            
            messages.success(request, 'Thank you! Your message has been sent successfully.')
            return redirect('freshmart:contact')
    else:
        form = ContactForm()
    
    context = {'form': form}
    return render(request, 'contact.html', context)

# CART VIEWS
def cart_view(request):
    cart = get_or_create_cart(request)
    cart_items = cart.items.select_related('product').all()
    
    context = {
        'cart': cart,
        'cart_items': cart_items,
    }
    return render(request, 'cart.html', context)

def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id, is_active=True)
    quantity = int(request.POST.get('quantity', 1))
    
    if product.stock_quantity < quantity:
        messages.error(request, 'Not enough stock available')
        return redirect('freshmart:product_detail', slug=product.slug)
    
    cart = get_or_create_cart(request)
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )
    
    if not created:
        cart_item.quantity += quantity
        if cart_item.quantity > product.stock_quantity:
            messages.error(request, 'Not enough stock available')
            return redirect('freshmart:product_detail', slug=product.slug)
        cart_item.save()
    
    messages.success(request, f'{product.name} added to cart!')
    return redirect('freshmart:cart')

def update_cart_item(request, item_id):
    cart = get_or_create_cart(request)
    cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
    quantity = int(request.POST.get('quantity', 1))
    
    if quantity <= 0:
        cart_item.delete()
        messages.success(request, 'Item removed from cart')
    elif quantity > cart_item.product.stock_quantity:
        messages.error(request, 'Not enough stock available')
    else:
        cart_item.quantity = quantity
        cart_item.save()
        messages.success(request, 'Cart updated')
    
    return redirect('freshmart:cart')

def remove_from_cart(request, item_id):
    cart = get_or_create_cart(request)
    cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
    cart_item.delete()
    messages.success(request, 'Item removed from cart')
    return redirect('freshmart:cart')

# CHECKOUT
@login_required
def checkout(request):
    cart = get_or_create_cart(request)
    
    if not cart.items.exists():
        messages.error(request, 'Your cart is empty')
        return redirect('freshmart:shop')
    
    if request.method == 'POST':
        form = CheckoutForm(request.POST)
        if form.is_valid():
            # Check stock
            for item in cart.items.all():
                if item.product.stock_quantity < item.quantity:
                    messages.error(request, f'Not enough stock for {item.product.name}')
                    return redirect('freshmart:cart')
            
            # Create order
            order = form.save(commit=False)
            order.user = request.user
            order.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
            order.total_amount = cart.total_price
            order.save()
            
            # Create order items
            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.effective_price
                )
                # Update stock
                item.product.stock_quantity -= item.quantity
                item.product.save()
            
            # Clear cart
            cart.items.all().delete()
            
            messages.success(request, f'Order placed successfully! Order number: {order.order_number}')
            return redirect('freshmart:order_success', order_id=order.id)
    else:
        form = CheckoutForm()
    
    context = {
        'cart': cart,
        'form': form,
    }
    return render(request, 'checkout.html', context)

@login_required
def order_success(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    context = {'order': order}
    return render(request, 'order_success.html', context)

@login_required
def my_orders(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items__product')
    context = {'orders': orders}
    return render(request, 'my_orders.html', context)