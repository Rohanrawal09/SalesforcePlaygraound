import { LightningElement } from 'lwc';
import convertCurrency from '@salesforce/apex/CurrencyConverterController.convertCurrency'

export default class CurrencyConverter extends LightningElement {
    fromCurrency = 'USD';
    toCurrency = 'INR';
    amount = 1;
    result;
    errorMessage;
    isLoading = false;

    currencyOptions = [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'INR', value: 'INR' }
    ];

    handleFromChange(event) {
        this.fromCurrency = event.detail.value;
    }

    handleToChange(event) {
        this.toCurrency = event.detail.value;
    }

    handleAmountChange(event) {
        this.amount = event.detail.value;
    }

    async handleConvert() {
        this.isLoading = true;
        this.errorMessage = undefined;
        this.result = undefined;

        try {
            this.result = await convertCurrency({
                fromCurrency: this.fromCurrency,
                toCurrency: this.toCurrency,
                amount: this.amount
            });
        } catch (error) {
            this.errorMessage = error.body ? error.body.message : 'Unexpected error';
        } finally {
            this.isLoading = false;
        }
    }

    get hasResult() {
        return this.result !== undefined;
    }

    get hasError() {
        return this.errorMessage !== undefined;
    }
}