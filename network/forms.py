from django import forms
from .models import Post

class NewPostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['content']
        labels = {
            'content': ''
        }
        widgets = {
            'content': forms.Textarea(attrs={
                'placeholder': 'Share your thoughts',
                'class': 'mb-1 form-control',
                'rows': '5'
            })
        }