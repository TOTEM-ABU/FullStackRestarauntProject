# Automatic Profit Calculation System

## Overview
This system automatically calculates and tracks profit for each order with detailed expense breakdown.

## Formula
**Sof foyda = Umumiy tushum - (Waiter haqi + Mahsulot tannarxi + Boshqa xarajatlar)**

### Example Calculation
- **Buyurtma summasi:** 100,000 so'm
- **Waiter haqi:** 10% = 10,000 so'm
- **Mahsulot tannarxi:** 40% = 40,000 so'm  
- **Boshqa xarajatlar (ijara va h.k):** 15% = 15,000 so'm
- **Sof foyda:** 100,000 - (10,000 + 40,000 + 15,000) = 35,000 so'm

## Automatic Actions

### 1. Order Creation
When an order is created, the system automatically:
- Validates the waiter exists and has WAITER role
- Calculates total order amount
- Calculates product costs (40% of product price)
- Calculates waiter salary (10% of total)
- Calculates other expenses (15% of total)
- Calculates net profit

### 2. Automatic Withdraw Records
The system creates 4 automatic withdraw records:

#### Expense Records (OUTCOME):
1. **Waiter Salary:** 10% of order total
   - Description: "Waiter salary for order {orderId}"
   - Automatically adds to waiter's balance

2. **Product Costs:** 40% of product prices
   - Description: "Product costs for order {orderId}"

3. **Other Expenses:** 15% of order total
   - Description: "Other expenses (rent, utilities) for order {orderId}"

#### Profit Record (INCOME):
4. **Net Profit:** Remaining amount after all expenses
   - Description: "Net profit from order {orderId}"

### 3. Database Changes
- Added `waiterId` field to Order model
- Added relation between Order and User (waiter)
- Updated CreateOrderDto to include waiterId

### 4. Frontend Updates
- Added waiter selection in order creation form
- Added waiter display in order table and view modal
- Added profit calculation display

## Usage

### Creating an Order
1. Select table number
2. Select restaurant
3. Select waiter (required)
4. Add products and quantities
5. System automatically calculates all expenses and profit

### Viewing Results
- Order table shows waiter information
- Order details show net profit calculation
- Withdraw records show detailed expense breakdown

## Benefits
- **Automatic tracking:** No manual calculation needed
- **Transparent expenses:** Clear breakdown of all costs
- **Accurate profit:** Mathematical precision in calculations
- **Waiter compensation:** Automatic salary distribution
- **Financial reporting:** Detailed withdraw records for accounting

## Configuration
The percentage rates can be adjusted in the order service:
- Waiter salary: 10% (0.10)
- Product costs: 40% (0.40) 
- Other expenses: 15% (0.15)
- Net profit: 35% (0.35)

## Database Migration
Run the following command to apply database changes:
```bash
cd restaraunt-backend
npx prisma migrate dev --name add_waiter_to_orders
``` 