from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Avg
from .models import Category, Product, Cart, CartItem, Order, OrderItem, ProductReview, Wishlist, ContactMessage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'product_count', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at',)
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'discounted_price', 'stock_quantity', 
                   'is_featured', 'is_bestseller', 'is_active', 'image_preview')
    list_filter = ('category', 'is_featured', 'is_bestseller', 'is_active', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at', 'image_preview', 'avg_rating', 'review_count')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'discounted_price', 'stock_quantity', 'unit')
        }),
        ('Media', {
            'fields': ('image', 'image_preview')
        }),
        ('Settings', {
            'fields': ('is_featured', 'is_bestseller', 'is_active')
        }),
        ('Additional Info', {
            'fields': ('nutrition_info',),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('avg_rating', 'review_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Image Preview'
    
    def avg_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 'No ratings'
    avg_rating.short_description = 'Average Rating'
    
    def review_count(self, obj):
        return obj.reviews.count()
    review_count.short_description = 'Reviews'

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('total_price',)
    
    def total_price(self, obj):
        return obj.total_price if obj.pk else 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_key', 'total_items', 'total_price', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'session_key')
    readonly_fields = ('created_at', 'updated_at', 'total_items', 'total_price')
    inlines = [CartItemInline]
    
    def total_items(self, obj):
        return obj.total_items
    total_items.short_description = 'Total Items'
    
    def total_price(self, obj):
        return f"${obj.total_price}"
    total_price.short_description = 'Total Price'

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('total_price',)
    
    def total_price(self, obj):
        return obj.total_price if obj.pk else 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_number', 'user__username', 'phone_number')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status', 'total_amount')
        }),
        ('Delivery Details', {
            'fields': ('delivery_address', 'phone_number', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        if not obj.order_number:
            import uuid
            obj.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save_model(request, obj, form, change)

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__name', 'user__username', 'comment')
    readonly_fields = ('created_at',)

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'product__name')
    readonly_fields = ('created_at',)

    @admin.register(ContactMessage)
    class ContactMessageAdmin(admin.ModelAdmin):
        list_display = ('name', 'email', 'subject', 'is_read', 'created_at')
        list_filter = ('is_read', 'created_at')
        search_fields = ('name', 'email', 'subject', 'message')
        readonly_fields = ('created_at',)