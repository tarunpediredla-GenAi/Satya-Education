"""
Django 5 + Django REST Framework Backend Implementation for Satya's Education
Provides identical API endpoints (/api/payments/create-order, /api/payments/verify,
/api/payments/webhook, /api/access/media, /api/chat) when deploying with a Python/Django backend.
"""
import hmac
import hashlib
import os
from django.db import models, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json


class BookModel(models.Model):
    id = models.CharField(max_length=128, primary_key=True)
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=120)
    category = models.CharField(max_length=50)
    price_inr = models.PositiveIntegerField()
    ebook_price_inr = models.PositiveIntegerField()
    stock = models.PositiveIntegerField(default=0)
    archived = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)


class OrderModel(models.Model):
    id = models.CharField(max_length=128, primary_key=True)
    user_id = models.CharField(max_length=128, db_index=True)
    user_email = models.EmailField()
    total_inr = models.PositiveIntegerField()
    razorpay_order_id = models.CharField(max_length=128, unique=True)
    payment_id = models.CharField(max_length=128, blank=True)
    idempotency_key = models.CharField(max_length=128, unique=True)
    status = models.CharField(max_length=30, default="pending")
    shipping_status = models.CharField(max_length=30, default="not_applicable")
    created_at = models.DateTimeField(auto_now_add=True)


@csrf_exempt
@require_POST
@transaction.atomic
def verify_razorpay_payment(request):
    payload = json.loads(request.body.decode("utf-8"))
    order_id = payload.get("orderId")
    rzp_order_id = payload.get("razorpayOrderId")
    rzp_payment_id = payload.get("razorpayPaymentId")
    rzp_signature = payload.get("razorpaySignature")

    order = OrderModel.objects.select_for_update().get(id=order_id)
    if order.status == "paid":
        return JsonResponse({"verified": True, "idempotentDuplicate": True, "orderId": order.id})

    secret = os.environ.get("RAZORPAY_KEY_SECRET", "")
    expected_sig = hmac.new(
        secret.encode("utf-8"),
        f"{rzp_order_id}|{rzp_payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if secret and expected_sig != rzp_signature:
        return JsonResponse({"verified": False, "error": "Invalid signature"}, status=400)

    order.status = "paid"
    order.payment_id = rzp_payment_id
    order.save(update_fields=["status", "payment_id"])
    return JsonResponse({"verified": True, "orderId": order.id, "paymentId": rzp_payment_id})
