import React, { useState } from "react";
import  Container  from "../Components/Container";
import Content from "../Components/Content";
import Wrapper from "../Components/Wrapper";
import "./PagesStyles/Order.css";
import AroowIco from "../Styles/icons/arrow_left.svg"
import {useNavigate} from "react-router"
import {Link} from "react-router-dom"
import {useParams} from "react-router-dom"
import { useEffect } from "react";
import OrderItem from "../Components/OrderItem";

const OrderEdit = () => {
    const nav = useNavigate()
    const params = useParams()
    const [descriptionStyle, setDescriptionStyle] = useState({background: "#92B76E"})
    const [orders, setOrders] = useState([])
    const [description, setDescription] = useState("Ожидает принятия в работу")
    let [order, setOrder] = useState({})
    const [waiterId, setWaiterId] = useState(3)
    const [message, setMessage] = useState()

    const fetchOrder = () => { 
        let token = JSON.parse(localStorage.getItem("token"))
        if(token != null || token != ""){
            token = JSON.parse(localStorage.getItem("token")).auth_token
            fetch("http://localhost:8088/api/orders/" + params.id + "/",{
                method: "GET",
                headers: { "Authorization": "Token "+ token,
                'Content-Type': 'application/json'} 
            })
            .then(response => response.json())
            .then(data => {
                if(data.detail == "Not found."){
                    nav("not found")
                    return
                }
                if(data.drinks == undefined){
                    fetchDishes(data)
                }
                else if(data.dishes == undefined){
                    fetchDrinks(data)
                }
                else {
                    fetchDishesAndDrinks(data)
                }
                setOrder(data)
                setComment(data.comment)
                setTableNumber(data.table_number)
            })   
        }     
    } 
    
    const fetchDishes = (orderData) => {
        fetch("http://localhost:8088/api/dishes/")
        .then(response => response.json())
        .then(data => {
            const newDishes = []
            orderData.dishes.forEach(dishId => {
                data.forEach(dish => {
                    if(dish.id == dishId){
                        newDishes.push(dish)
                    }
                })
            });
            setOrders([...orders, ...newDishes])
        })   
    }

    const fetchDrinks = (orderData) => {
        fetch("http://localhost:8088/api/drinks/")
        .then(response => response.json())
        .then(data => {
            const newDrinks = []
            orderData.drinks.forEach(drinkId => {
                data.forEach(drink => {
                    if(drink.id == drinkId){
                        newDrinks.push(drink)
                    }
                })
            });
            setOrders([...orders, ...newDrinks])
        })  
    }

    const fetchDishesAndDrinks = (orderData) => {
        fetch("http://localhost:8088/api/dishes/")
        .then(response => response.json())
        .then(data => {
            const newDishes = []
            orderData.dishes.forEach(dishId => {
                data.forEach(dish => {
                    if(dish.id == dishId){
                        newDishes.push(dish)
                    }
                })
            });
            
            fetch("http://localhost:8088/api/drinks/")
            .then(response => response.json())
            .then(data => {
                const newDrinks = []
                orderData.drinks.forEach(drinkId => {
                    data.forEach(drink => {
                        if(drink.id == drinkId){
                            newDrinks.push(drink)
                        }
                    })
                });
                setOrders([...orders, ...newDrinks, ...newDishes])
            })  
        })   
    }

    const fetchUsers = () => {
        const token = JSON.parse(localStorage.getItem("token")).auth_token
        fetch("http://localhost:8088/api/users/",{
            method: "GET",
            headers: { "Authorization": "Token "+ token,
            'Content-Type': 'application/json'} 
        })
        .then(response => response.json())
        .then(data => {
            const newWaiters = []
            data.forEach(worker => {
                if(worker.role == "W"){
                    newWaiters.push(worker)
                }
            })
            setWaiters(newWaiters)
        })  
    }
    
    const patchOrder = () => {
        if(JSON.parse(localStorage.getItem("token")) != null ){
            const token = JSON.parse(localStorage.getItem("token")).auth_token
            const requestOptions = {
                method: "PATCH",
                headers: { "Authorization": "Token "+ token,
                'Content-Type': 'application/json'}, 
                body: JSON.stringify({
                    comment: comment,
                    table_number: tableNumber,
                    waiter: waiterId
                })
            }
            fetch("http://127.0.0.1:8088/api/orders/" + order.id + "/", requestOptions)
            .then(response => {
                if(response.ok){
                    console.log(response)
                }
                else{
                    setMessage("Данные не верны")
                    
                }
            })    
        }
    }

    useEffect(() => {
        fetchOrder()
        fetchUsers()
    }, []) 

    useEffect(() => {
        changeDescription() 
        changeDescriptionColor()
    }, [order])


    const changeDescription = () => {
        if(order.status == "NA"){
            setDescription("Ожидает принятия в работу")
        }
        else if(order.status == "IP" || order.status == "DDS" || order.status == "DDR"){
            setDescription("Ожидает приготовления")
        }
        else if(order.status == "DONE"){
            setDescription("Ожидает доставки")
        }
    }

    const changeDescriptionColor = () => {
        if(order.status == "IP" || order.status == "DDS" || order.status == "DDR"){
            setDescriptionStyle({background: "#BBC175"})
        }
        else if(order.status == "DONE"){
            setDescriptionStyle({background: "#C17575"})
        }
    }

    const [comment, setComment] = useState("")
    const [tableNumber, setTableNumber] = useState("")
    const [waiters, setWaiters] = useState([])

    return (
        <Wrapper> 
            <div className="order__page__bg">
                <Container>
                    <Content>    
                            <div className="order__flex__column">
                                <div className="order__back__flex">
                                    <div className="back__button">
                                        <Link onClick={() => nav(-1)}><img src={AroowIco} className="arrow__icon"></img></Link>
                                    </div>
                                    <div className="back__info">
                                        Отмена редактирования
                                    </div>
                                </div>
                                <div className="order__info__flex">
                                    <div className="order__header__flex">
                                        <div className="number__info__flex">
                                            <div className="oreder__number">
                                                {order.id}
                                            </div>
                                            <div className="table__info">
                                                номер стола <span className="table__number"><input value={tableNumber}onChange={e => {
                                                if(e.target.value.slice(-1).match(/[0-9]/)|| e.target.value == ""){
                                                    setTableNumber(e.target.value)
                                                }
                                                }} maxLength={3} >
                                                </input>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="role__info__flex">
                                            <div className="waiter__info">
                                                <select onChange={e => setWaiterId(e.target.value)}>
                                                    {waiters.map(waiter => 
                                                        <option key={waiter.id} value={waiter.id}>{waiter.id}.{waiter.first_name} {waiter.last_name}</option>    
                                                    )}
                                                </select>
                                            </div>
                                            <div style={descriptionStyle} className="order__status">
                                                {description}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="order__application">
                                        <div className="application__title">{order.comment == "" ? "" : "Примечание:"}</div>
                                        <div className="application__info">
                                            <textarea onChange={e => setComment(e.target.value)} value={comment}></textarea>
                                        </div>
                                    </div>
                                    <div className="order__done__button">
                                        <button onClick={patchOrder}>Принять изменения</button>
                                    </div>
                                    <div className="orders__list__grid">
                                        {orders.map(el => 
                                                <OrderItem deleteButton={true} key={el.id + el.name} name={el.name} imgSource={el.image}></OrderItem>
                                        )}
                                    </div>       
                                </div>
                            </div>
                    </Content>
                </Container>
            </div>
        </Wrapper>
    );
}

export default OrderEdit;