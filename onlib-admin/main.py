import tkinter as tk
from tkinter import ttk, messagebox
import requests

BASE_URL = 'http://localhost:5000'

class AdminInterface(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("OnLib - Admin Interface")
        self.geometry("800x600")

        self.create_widgets()

    def create_widgets(self):
        self.notebook = ttk.Notebook(self)
        self.notebook.pack(expand=True, fill='both')

        self.create_books_tab()
        self.create_loans_tab()
        self.create_users_tab()
        self.create_payments_tab()
        

        # ------------------ ABA DE PAGAMENTOS ------------------
    def create_payments_tab(self):
        payments_frame = ttk.Frame(self.notebook)
        self.notebook.add(payments_frame, text='Payments')

        # Botão de refresh
        refresh_button = ttk.Button(payments_frame, text="Refresh Payments", command=self.load_payments)
        refresh_button.pack(pady=5)

        # Botão de atualizar subscrição
        update_subscription_button = ttk.Button(payments_frame, text="Update Subscription", command=self.update_subscription)
        update_subscription_button.pack(pady=5)

        # Botão de aplicar taxas
        apply_fees_button = ttk.Button(payments_frame, text="Apply Late Fees", command=self.apply_late_fees)
        apply_fees_button.pack(pady=5)

        # Tabela de pagamentos
        self.payments_table = ttk.Treeview(
            payments_frame,
            columns=("User ID", "Name", "Email", "Status", "Next Payment Date", "Last Payment Date", "Amount"),
            show="headings",
            height=20
        )
        self.payments_table.heading("User ID", text="User ID")
        self.payments_table.heading("Name", text="Name")
        self.payments_table.heading("Email", text="Email")
        self.payments_table.heading("Status", text="Status")
        self.payments_table.heading("Next Payment Date", text="Next Payment Date")
        self.payments_table.heading("Last Payment Date", text="Last Payment Date")
        self.payments_table.heading("Amount", text="Amount (€)")
        self.payments_table.pack(pady=10, fill=tk.BOTH, expand=True)

        self.load_payments()

    def load_payments(self):
        try:
            response = requests.get(f'{BASE_URL}/admin/payments/status')
            if response.status_code == 200:
                payments = response.json()
                self.payments_table.delete(*self.payments_table.get_children())
                for payment in payments:
                    # Verificar se há atraso
                    status = payment.get('subscriptionStatus', 'N/A')
                    next_payment_date = payment.get('nextPaymentDate', 'N/A')
                    overdue = False
                    if next_payment_date != 'N/A' and status == 'active':
                        overdue = self.check_overdue(next_payment_date)

                    # Inserir na tabela
                    row_id = self.payments_table.insert("", "end", values=(
                        payment.get('userId', 'N/A'),
                        payment.get('name', 'N/A'),
                        payment.get('email', 'N/A'),
                        status,
                        next_payment_date,
                        payment.get('lastPaymentDate', 'N/A'),
                        payment.get('amount', 'N/A')
                    ))

                    # Destacar pagamentos atrasados
                    if overdue:
                        self.payments_table.item(row_id, tags=('overdue',))
                # Configurar tags para atrasados
                self.payments_table.tag_configure('overdue', background='red')
            else:
                messagebox.showerror("Error", f"Failed to fetch payments: {response.status_code}")
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {e}")

    def check_overdue(self, next_payment_date):
        from datetime import datetime
        try:
            cleaned_date = next_payment_date.split("T")[0]
            next_date = datetime.strptime(cleaned_date, "%Y-%m-%d")
            return next_date < datetime.now()
        except Exception as e:
            print(f"Error parsing date: {e}")
            return False

    def update_subscription(self):
        selected_item = self.payments_table.selection()
        if not selected_item:
            messagebox.showinfo("Info", "Please select a user to update the subscription.")
            return

        payment_data = self.payments_table.item(selected_item)['values']
        user_id = payment_data[0]

        update_window = tk.Toplevel(self)
        update_window.title("Update Subscription")

        tk.Label(update_window, text="Status:").pack(pady=5)
        status_entry = ttk.Combobox(update_window, values=["active", "inactive"])
        status_entry.set(payment_data[3])
        status_entry.pack(pady=5)

        tk.Label(update_window, text="Next Payment Date (YYYY-MM-DD):").pack(pady=5)
        next_payment_entry = tk.Entry(update_window)
        next_payment_entry.insert(0, payment_data[4])
        next_payment_entry.pack(pady=5)

        tk.Label(update_window, text="Last Payment Date (YYYY-MM-DD):").pack(pady=5)
        last_payment_entry = tk.Entry(update_window)
        last_payment_entry.insert(0, payment_data[5])
        last_payment_entry.pack(pady=5)

        def save_update():
            payload = {
                "status": status_entry.get(),
                "nextPaymentDate": next_payment_entry.get(),
                "lastPaymentDate": last_payment_entry.get()
            }
            try:
                response = requests.put(f'{BASE_URL}/admin/payments/update/{user_id}', json=payload)
                if response.status_code == 200:
                    messagebox.showinfo("Success", "Subscription updated successfully.")
                    update_window.destroy()
                    self.load_payments()
                else:
                    messagebox.showerror("Error", f"Failed to update subscription: {response.status_code}")
            except Exception as e:
                messagebox.showerror("Error", f"An error occurred: {e}")

        tk.Button(update_window, text="Save", command=save_update).pack(pady=20)

    def apply_late_fees(self):
        selected_item = self.payments_table.selection()
        if not selected_item:
            messagebox.showinfo("Info", "Please select a user to apply late fees.")
            return

        payment_data = self.payments_table.item(selected_item)['values']
        user_id = payment_data[0]

        confirm = messagebox.askyesno("Confirm", f"Apply late fees for user {payment_data[1]}?")
        if confirm:
            try:
                response = requests.post(f'{BASE_URL}/late-fees/apply', json={"userId": user_id})
                if response.status_code == 200:
                    messagebox.showinfo("Success", "Late fees applied successfully.")
                    self.load_payments()
                else:
                    messagebox.showerror("Error", f"Failed to apply late fees: {response.status_code}")
            except Exception as e:
                messagebox.showerror("Error", f"An error occurred: {e}")


    # ------------------ ABA DE LIVROS ------------------

    def create_books_tab(self):
        books_frame = ttk.Frame(self.notebook)
        self.notebook.add(books_frame, text='Books')

        add_button = ttk.Button(books_frame, text="Add Book", command=self.add_book)
        add_button.pack(pady=10)

        remove_button = ttk.Button(books_frame, text="Remove Book", command=self.remove_book)
        remove_button.pack(pady=10)

        edit_button = ttk.Button(books_frame, text="Edit Book", command=self.edit_book)
        edit_button.pack(pady=10)

        self.books_table = ttk.Treeview(books_frame, columns=("ID", "Title", "Author"), show="headings")
        self.books_table.heading("ID", text="ID")
        self.books_table.heading("Title", text="Title")
        self.books_table.heading("Author", text="Author")
        self.books_table.pack(pady=10)

        self.load_books()

    def load_books(self):
        try:
            response = requests.get(f'{BASE_URL}/books')
            if response.status_code == 200:
                books = response.json()
                self.books_table.delete(*self.books_table.get_children())
                for book in books:
                    self.books_table.insert("", "end", values=(book['id'], book['title'], book['author']))
            else:
                print('Failed to fetch books')
                print(response.status_code, response.text)
        except Exception as e:
            print(f'Error: {e}')

    def add_book(self):
        add_window = tk.Toplevel(self)
        add_window.title("Add Book")

        tk.Label(add_window, text="Title:").pack(pady=5)
        title_entry = tk.Entry(add_window)
        title_entry.pack(pady=5)

        tk.Label(add_window, text="Author:").pack(pady=5)
        author_entry = tk.Entry(add_window)
        author_entry.pack(pady=5)

        tk.Button(add_window, text="Add", command=lambda: self.save_book(title_entry.get(), author_entry.get(), add_window)).pack(pady=20)

    def save_book(self, title, author, window=None):
        payload = {'title': title, 'author': author}
        try:
            response = requests.post(f'{BASE_URL}/books', json=payload)
            if response.status_code == 200:
                print('Book saved successfully')
                if window:
                    window.destroy()
                self.load_books()
            else:
                print('Failed to save book')
                print(response.status_code, response.text)
        except Exception as e:
            print(f'Error: {e}')

    def remove_book(self):
        selected_item = self.books_table.selection()
        if not selected_item:
            print("No book selected")
            return

        book_data = self.books_table.item(selected_item)['values']
        book_id = book_data[0]

        confirm = messagebox.askyesno("Confirm Delete", "Are you sure you want to delete this book?")
        if confirm:
            try:
                response = requests.delete(f'{BASE_URL}/books/{book_id}')
                if response.status_code == 200:
                    print('Book removed successfully')
                    self.load_books()
                else:
                    print('Failed to remove book')
                    print(response.status_code, response.text)
            except Exception as e:
                print(f'Error: {e}')

    def edit_book(self):
        selected_item = self.books_table.selection()
        if not selected_item:
            print("No book selected")
            return

        book_data = self.books_table.item(selected_item)['values']
        book_id = book_data[0]

        edit_window = tk.Toplevel(self)
        edit_window.title("Edit Book")

        tk.Label(edit_window, text="New Title:").pack(pady=5)
        title_entry = tk.Entry(edit_window)
        title_entry.insert(0, book_data[1])
        title_entry.pack(pady=5)

        tk.Label(edit_window, text="New Author:").pack(pady=5)
        author_entry = tk.Entry(edit_window)
        author_entry.insert(0, book_data[2])
        author_entry.pack(pady=5)

        tk.Button(edit_window, text="Save", command=lambda: self.update_book(book_id, title_entry.get(), author_entry.get(), edit_window)).pack(pady=20)

    def update_book(self, book_id, new_title, new_author, window):
        payload = {'title': new_title, 'author': new_author}
        try:
            response = requests.put(f'{BASE_URL}/books/{book_id}', json=payload)
            if response.status_code == 200:
                print('Book updated successfully')
                window.destroy()
                self.load_books()
            else:
                print('Failed to update book')
                print(response.status_code, response.text)
        except Exception as e:
            print(f'Error: {e}')

    # ------------------ ABA DE EMPRÉSTIMOS ------------------

    def create_loans_tab(self):
        loans_frame = ttk.Frame(self.notebook)
        self.notebook.add(loans_frame, text='Loans')

        self.loans_table = ttk.Treeview(loans_frame, columns=("ID", "User", "Book", "Loan Date", "Return Date"), show="headings")
        self.loans_table.heading("ID", text="ID")
        self.loans_table.heading("User", text="User")
        self.loans_table.heading("Book", text="Book")
        self.loans_table.heading("Loan Date", text="Loan Date")
        self.loans_table.heading("Return Date", text="Return Date")
        self.loans_table.pack(pady=10, fill=tk.BOTH, expand=True)

        view_loans_button = ttk.Button(loans_frame, text="Refresh Loans", command=self.load_loans)
        view_loans_button.pack(pady=10)

        self.load_loans()

    def load_loans(self):
        try:
            response = requests.get(f'{BASE_URL}/loans')
            if response.status_code == 200:
                loans = response.json()
                self.loans_table.delete(*self.loans_table.get_children())
                for loan in loans:
                    self.loans_table.insert("", "end", values=(
                        loan['id'],
                        loan['user_name'],
                        loan['book_title'],
                        loan['loan_date'],
                        loan.get('return_date', 'Not Returned')
                    ))
            else:
                print('Failed to fetch loans')
                print(response.status_code, response.text)
        except Exception as e:
            print(f'Error: {e}')

    # ------------------ ABA DE UTILIZADORES ------------------

    def create_users_tab(self):
        users_frame = ttk.Frame(self.notebook)
        self.notebook.add(users_frame, text='Users')

        self.users_table = ttk.Treeview(users_frame, columns=("ID", "Name", "Email"), show="headings")
        self.users_table.heading("ID", text="ID")
        self.users_table.heading("Name", text="Name")
        self.users_table.heading("Email", text="Email")
        self.users_table.pack(pady=10, fill=tk.BOTH, expand=True)

        add_button = ttk.Button(users_frame, text="Add User", command=self.add_user)
        add_button.pack(pady=5)

        edit_button = ttk.Button(users_frame, text="Edit User", command=self.edit_user)
        edit_button.pack(pady=5)

        remove_button = ttk.Button(users_frame, text="Remove User", command=self.remove_user)
        remove_button.pack(pady=5)

        refresh_button = ttk.Button(users_frame, text="Refresh Users", command=self.load_users)
        refresh_button.pack(pady=5)

        self.load_users()

    def load_users(self):
        try:
            response = requests.get(f'{BASE_URL}/users')
            if response.status_code == 200:
                users = response.json()
                self.users_table.delete(*self.users_table.get_children())
                for user in users:
                    self.users_table.insert("", "end", values=(user['id'], user['name'], user['email']))
            else:
                print('Failed to fetch users')
                print(response.status_code, response.text)
        except Exception as e:
            print(f'Error: {e}')

    def add_user(self):
        add_window = tk.Toplevel(self)
        add_window.title("Add User")

        tk.Label(add_window, text="Name:").pack(pady=5)
        name_entry = tk.Entry(add_window)
        name_entry.pack(pady=5)

        tk.Label(add_window, text="Email:").pack(pady=5)
        email_entry = tk.Entry(add_window)
        email_entry.pack(pady=5)

        tk.Label(add_window, text="Password:").pack(pady=5)
        password_entry = tk.Entry(add_window, show="*")
        password_entry.pack(pady=5)

        tk.Button(add_window, text="Add", command=lambda: self.save_user(name_entry.get(), email_entry.get(), password_entry.get(), add_window)).pack(pady=20)

    def save_user(self, name, email, password, window=None):
        payload = {'name': name, 'email': email, 'password': password}
        try:
            response = requests.post(f'{BASE_URL}/users', json=payload)
            if response.status_code == 200:
                print('User added successfully')
                if window:
                    window.destroy()
                self.load_users()
            else:
                print('Failed to add user')
                print(response.status_code, response.text)
        except Exception as e:
            print(f'Error: {e}')

    def edit_user(self):
        selected_item = self.users_table.selection()
        if not selected_item:
            print("No user selected")
            return

        user_data = self.users_table.item(selected_item)['values']
        user_id = user_data[0]

        edit_window = tk.Toplevel(self)
        edit_window.title("Edit User")

        tk.Label(edit_window, text="New Name:").pack(pady=5)
        name_entry = tk.Entry(edit_window)
        name_entry.insert(0, user_data[1])
        name_entry.pack(pady=5)

        tk.Label(edit_window, text="New Email:").pack(pady=5)
        email_entry = tk.Entry(edit_window)
        email_entry.insert(0, user_data[2])
        email_entry.pack(pady=5)

        tk.Label(edit_window, text="New Password (optional):").pack(pady=5)
        password_entry = tk.Entry(edit_window, show="*")
        password_entry.pack(pady=5)

        tk.Button(edit_window, text="Save", command=lambda: self.update_user(user_id, name_entry.get(), email_entry.get(), password_entry.get(), edit_window)).pack(pady=20)

    def update_user(self, user_id, name, email, password, window):
        payload = {'name': name, 'email': email}
        if password:
            payload['password'] = password

        try:
            response = requests.put(f'{BASE_URL}/users/{user_id}', json=payload)
            if response.status_code == 200:
                print('User updated successfully')
                window.destroy()
                self.load_users()
            else:
                print('Failed to update user')
                print(response.status_code, response.text)
        except Exception as e:
            print(f'Error: {e}')

    def remove_user(self):
        selected_item = self.users_table.selection()
        if not selected_item:
            print("No user selected")
            return

        user_data = self.users_table.item(selected_item)['values']
        user_id = user_data[0]

        confirm = messagebox.askyesno("Confirm Delete", "Are you sure you want to delete this user?")
        if confirm:
            try:
                response = requests.delete(f'{BASE_URL}/users/{user_id}')
                if response.status_code == 200:
                    print('User removed successfully')
                    self.load_users()
                else:
                    print('Failed to remove user')
                    print(response.status_code, response.text)
            except Exception as e:
                print(f'Error: {e}')


if __name__ == "__main__":
    app = AdminInterface()
    app.mainloop()
