from django import forms 
from django.core.validators import EmailValidator
from .models import ProductReview, ContactMessage ,Order

class ProductReviewForm(forms.ModelForm):
    class Meta:
        model = ProductReview
        fields = ['rating','comment']
        widgets = {
            'rating':forms.Select(choices = [(i,i) for i in range(1,6)],
                                  attrs={'class':'forms = control'}),
            'comment':forms.Textarea(attr={
                'class': ' form-control',
                'rows':4,
                'placeholder':'Share your Experience with this product...'
            })
        }
    def clean_rating(self):
        rating = self.cleaned_data.get('rating')
        if rating < 1 or rating > 5:
            raise forms.ValidationError('Rating must be between 1 and 5')
        return rating
class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ['name','email','subject','message']
        widget = {
            'name': forms.Textarea(attrs={
                'class':'form-control',
                'placeholder':'Your name',
                'required': True
            }),
            'email':forms.EmailInput(attrs={
                'class':'form-control',
                'placeholder':'your.email@example.com',
                'required':True
            }),
            'subject':forms.TextInput(attrs={
                'class':'form-control',
                'placeholder':'Subject',
                'required':True
            }),
            'message':forms.Textarea(attrs={
                'class': 'form-control',
                'rows':5,
                'placeholder':'Your message...',
                'required': True
            })
       }
    def clean_email(self):
        email = self.cleaned_data.get('email')
        validator = EmailValidator
        validator(email)
        return email

    def clean_message(self):
        message= self.cleaned_data.get('message')
        if len(message) < 10:
            raise forms.ValidationError('Message must be at least 10 characters long')
        return message
class CheckoutForm(forms.ModelForm):
    class Meta:
        model = Order
        field = ['delivery_address','phone_number','notes']
        widgets = {
            'delivery_address':forms.Textarea(attrs={
                'class':'form-control',
                'row':3,
                'placeholder':'Enter your full delivery address'
            }),
            'phone_number':forms.TextInput(attrs={
                'class':'form-control',
                'placeholder': ' +12345677890'
            }),
            'notes':forms.Textarea(attrs={
                'class': 'form-control',
                'rows':2,
                'placeholder':'Any Special instructions (optional)'
            })
        }
    def clean_phone_number(self):
        phone = self.cleaned_data.get('phone_number')
        import re
        if not re.match(r'^\+?1?\d{9,15}$',phone):
            raise forms.ValidationError('Enter a valid phone number')
        return phone