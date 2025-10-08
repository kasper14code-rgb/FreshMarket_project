from django.contrib import admin

# Register your models here.
from django.utils.html import format_html
from .models import Category, Product, Review, ContactMessage, Order, OrderItem


# Category Admin
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count', 'description_preview')
    search_fields = ('name', 'description')
    ordering = ('name',)
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Number of Products'
    
    def description_preview(self, obj):
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    description_preview.short_description = 'Description'


# Product Admin
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'featured', 'image_preview', 'review_count')
    list_filter = ('category', 'featured')
    search_fields = ('name', 'description')
    list_editable = ('featured', 'price')
    ordering = ('name',)
    readonly_fields = ('image_preview_large',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'description')
        }),
        ('Pricing & Display', {
            'fields': ('price', 'featured')
        }),
        ('Media', {
            'fields': ('image_url', 'image_preview_large')
        }),
    )
    
    def image_preview(self, obj):
        if obj.image_url:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />', obj.image_url)
        return '-'
    image_preview.short_description = 'Image'
    
    def image_preview_large(self, obj):
        if obj.image_url:
            return format_html('<img src="{}" width="200" style="border-radius: 8px;" />', obj.image_url)
        return 'No image available'
    image_preview_large.short_description = 'Product Image'
    
    def review_count(self, obj):
        count = obj.reviews.count()
        return f"{count} review{'s' if count != 1 else ''}"
    review_count.short_description = 'Reviews'


# Review Admin
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'rating_stars', 'comment_preview', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('name', 'comment', 'product__name')
    readonly_fields = ('created_at', 'user')
    ordering = ('-created_at',)
    
    def rating_stars(self, obj):
        stars = '⭐' * obj.rating
        return format_html('<span style="font-size: 16px;">{}</span>', stars)
    rating_stars.short_description = 'Rating'
    
    def comment_preview(self, obj):
        return obj.comment[:60] + '...' if len(obj.comment) > 60 else obj.comment
    comment_preview.short_description = 'Comment'


# Contact Message Admin
@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'message_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('name', 'email', 'message', 'created_at')
    ordering = ('-created_at',)
    
    def message_preview(self, obj):
        return obj.message[:80] + '...' if len(obj.message) > 80 else obj.message
    message_preview.short_description = 'Message'
    
    def has_add_permission(self, request):
        # Users submit contact forms on the website, not in admin
        return False


# Order Item Inline (for Order Admin)
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'subtotal')
    can_delete = False
    
    def subtotal(self, obj):
        return f"${obj.product.price * obj.quantity:.2f}"
    subtotal.short_description = 'Subtotal'


# Order Admin
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user_display', 'total_items', 'order_total', 'completed', 'created_at')
    list_filter = ('completed', 'created_at')
    search_fields = ('id', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'order_total_display')
    list_editable = ('completed',)
    ordering = ('-created_at',)
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('user', 'created_at', 'completed')
        }),
        ('Order Summary', {
            'fields': ('order_total_display',)
        }),
    )
    
    def order_number(self, obj):
        return f"#{obj.id}"
    order_number.short_description = 'Order'
    
    def user_display(self, obj):
        if obj.user:
            return obj.user.username
        return 'Guest'
    user_display.short_description = 'Customer'
    
    def total_items(self, obj):
        total = sum(item.quantity for item in obj.items.all())
        return f"{total} item{'s' if total != 1 else ''}"
    total_items.short_description = 'Items'
    
    def order_total(self, obj):
        total = sum(item.product.price * item.quantity for item in obj.items.all())
        return f"${total:.2f}"
    order_total.short_description = 'Total'
    
    def order_total_display(self, obj):
        total = sum(item.product.price * item.quantity for item in obj.items.all())
        return format_html('<strong style="font-size: 18px; color: #28a745;">${:.2f}</strong>', total)
    order_total_display.short_description = 'Order Total'


# # Optional: Customize Admin Site Header
# admin.site.site_header = "FreshMart Administration"
# admin.site.site_title = "FreshMart Admin"
# admin.site.index_title = "Welcome to FreshMart Admin Portal"
