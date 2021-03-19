import React, { Component } from 'react';

import Aux from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import axios from '../../axios-orders';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';


//written with capital letter to highlight that this is global variable 
const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
};

class BurgerBuilder extends Component {

    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount() {
        axios.get('/ingredients.json')
            .then(response => this.setState({ ingredients: response.data }))
            .catch(error => this.setState({error: true}))
    }

    //check if any ingredient has been added 
    updatePurchaseState(ingredients) {
        const sum = Object.values(ingredients)
            .reduce((sum, el) => sum + el)
        this.setState({ purchasable: sum > 0 });
    }


    addIngredientHandler = (type) => {
        const updatedIngredients = { ...this.state.ingredients };
        let updatedPrice = this.state.totalPrice;
        updatedIngredients[type]++;
        updatedPrice += INGREDIENT_PRICES[type];
        this.setState({ totalPrice: updatedPrice, ingredients: updatedIngredients })
        this.updatePurchaseState(updatedIngredients)
    }

    removeIngredientHandler = (type) => {
        if (this.state.ingredients[type] <= 0) return;
        const updatedIngredients = { ...this.state.ingredients };
        let updatedPrice = this.state.totalPrice;
        updatedIngredients[type] -= 1;
        updatedPrice -= INGREDIENT_PRICES[type];
        this.setState({ totalPrice: updatedPrice, ingredients: updatedIngredients })
        this.updatePurchaseState(updatedIngredients)
    }

    // inovked when "Order Now" button is clicked
    purchaseHandler = () => {
        this.setState({ purchasing: true });
    }

    purchaseCancelHandler = () => {
        this.setState({ purchasing: false });
    }

    purchaseContinueHandler = () => {
        this.setState({ loading: true });
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
        }
        axios.post('/orders.json', order)
            .then(response => {
                console.log(response);
                this.setState({ loading: false, purchasing: false });
            })
            .catch(error => {
                console.log(error);
                this.setState({ loading: false, purchasing: false })
            })
    }

    render() {
        const disabledIngriedientsInfo = { ...this.state.ingredients };
        for (let ingredient in disabledIngriedientsInfo) {
            disabledIngriedientsInfo[ingredient] = disabledIngriedientsInfo[ingredient] <= 0
        }

        let burger = this.state.error ? <p>Problem with fetichg data</p> : <Spinner /> 
        // burger and orderSummary are using state.ingredients, which is fetch from firebase so initially it's null 
        if (this.state.ingredients) {
            burger = (
                <Aux>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControls
                        ingredientAdded={this.addIngredientHandler}
                        ingredientRemoved={this.removeIngredientHandler}
                        disabled={disabledIngriedientsInfo}
                        purchasable={this.state.purchasable}
                        ordered={this.purchaseHandler}
                        price={this.state.totalPrice} />
                </Aux>
            )
        } 

        let orderSummary = null;

        if (this.state.ingredients) {
            let orderSummary = <OrderSummary
                ingredients={this.state.ingredients}
                price={this.state.totalPrice}
                purchaseCancelled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler} />;
        }

        if (this.state.loading) {
            orderSummary = <Spinner />;
        }

        return (
            <Aux>
                <Modal show={this.state.purchasing} close={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);