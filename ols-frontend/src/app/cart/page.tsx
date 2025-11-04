'use client';

import { useEffect, useState, useContext } from "react";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Course } from '../../types/course';
import axiosInstance from '../lib/axiosInstance';
import { UserContext } from '../context/UserProvider';
import { CashItemPrepare, CashItemVerify } from '../../types/payment';

function CartPage() {
    const [cartItems, setCartItems] = useState<Course[]>([]);
    const [selectedItemsIds, setSelectedItemsIds] = useState<Set<number>>(new Set());
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const router = useRouter();
    const userContext = useContext(UserContext);

    useEffect(() => {
        const selectedCourses = cartItems.filter(item => selectedItemsIds.has(item.courseId));
        const newTotalPrice = selectedCourses.reduce((acc, item) => acc + item.price, 0);
        setTotalPrice(newTotalPrice);
    }, [selectedItemsIds, cartItems]);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
        script.async = true;
        document.body.appendChild(script);

        fetchCartItemList();

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const fetchCartItemList = async () => {
        try {
            const response = await axiosInstance.get('/carts');
            const res: Course[] = response.data;
            setCartItems(res);
        } catch(err) {
            console.log('fetchCartItems: ' + err);
        }
    };

    const handleItemClick = async (itemId: number) => {
        handleItemSelection(itemId);
    };

    const handleItemSelection = (itemId: number) => {
        setSelectedItemsIds((prev) => {
            const newSet = new Set(prev);

            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    if (!userContext || !userContext.userInfo) {
        console.log('Navbar userContext error');
        return;
    }

    const { userInfo } = userContext;

    const handleConfirmDelete = async () => {
        if (selectedItemsIds.size == 0) {
            alert('삭제할 강의를 선택해주세요.');
            return;
        }

        if (!confirm(`${selectedItemsIds.size}개의 강의를 정말 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const deleteTargetList = Array.from(selectedItemsIds);
            const res = await axiosInstance.post(`/carts/delete`, { courseIds: deleteTargetList }); 

            alert('선택된 강의가 성공적으로 삭제되었습니다.');
            setSelectedItemsIds(new Set());
            fetchCartItemList();
        } catch(error) {
            console.log('Course delete error from cart => ' + error);
        }
    };

    const handleConfirmPayment = async () => {
        if (selectedItemsIds.size == 0) {
            alert('구매할 강의를 선택해주세요.');
            return;
        }

        if (!confirm(`${selectedItemsIds.size}개의 강의를 구매하시겠습니까?`)) {
            return;
        }

        try {
            const paymentTargetList = Array.from(selectedItemsIds);
            const prepareRes = await axiosInstance.post('/cash/prepare', { courseIds: paymentTargetList }); // 사전검증
            const prepareData: CashItemPrepare = prepareRes.data;

            // 결제 진행
            if (!window.IMP) {
                alert('결제 모듈 로딩 실패');
                return;
            }

            const { IMP } = window;
            const initKey: string | undefined = process.env.NEXT_PUBLIC_IM_PORT_INIT_KEY;
            const channelKey: string | undefined = process.env.NEXT_PUBLIC_IM_PORT_CHANNEL_KEY; 

            if (!initKey || !channelKey) {
                console.log('api key 미설정');
                return;
            }

            console.log(initKey + " " + channelKey);

            IMP.init(initKey); // 고객사 식별코드

            IMP.request_pay(
                {
                    pg: 'html5_inicis',
                    channelKey: channelKey,
                    pay_method: "card",
                    merchant_uid: prepareData.merchantUid,
                    name: prepareData.titleName,
                    amount: prepareData.totalAmount,
                    buyer_name: userInfo.username,
                    buyer_email: userInfo.email,
                },
                async (res) => {
                    // console.log(res);
                    if (res.success) {
                        try { // 사후 검증
                            const verifyDto: CashItemVerify = {
                                impUid: res.imp_uid,
                                merchantUid: res.merchant_uid,
                                courseIds: paymentTargetList
                            };
                            
                            const afterRes = await axiosInstance.post('/cash/after', verifyDto);
                            alert('결제 성공');
                            router.push('/');
                        } catch(err: any) {
                            console.log(err);
                        }
                    }
                    else {
                        console.log(res.error_msg);
                        alert('결제 실패');
                    }
                }
            )
        } catch(err: any) {
            if (axios.isAxiosError(err)) {
                console.log('axios error => ' + err);
            }
            console.log(err.response?.status);
        }
    };

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1 className="cart-title">장바구니 🛒</h1>
            </div>

            {cartItems.length === 0 ? (
                <p className="empty-cart-message">장바구니에 담긴 강의가 없습니다.</p>
            ) : (
                <>
                <div className="cart-items-container">
                    {cartItems.map((item) => (
                    <div
                        key={item.courseId}
                        className={`cart-item ${selectedItemsIds.has(item.courseId) ? 'selected' : ''}`}
                        onClick={() => handleItemClick(item.courseId)}
                    >
                        <input
                            type="checkbox"
                            checked={selectedItemsIds.has(item.courseId)}
                            readOnly
                            className="item-checkbox"
                        />
                        <img src={'https://localhost/' + item.imagePath} alt={item.courseName} className="item-image" />
                        <div className="cart-item-details">
                            <h3 className="cart-item-name">{item.courseName}</h3>
                            <p className="cart-item-price">{item.price.toLocaleString()}원</p>
                        </div>
                    </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h2 className="summary-title">결제 금액</h2>
                    <div className="summary-details">
                        <p>총 상품 금액:</p>
                        <p className="total-price">{totalPrice.toLocaleString()}원</p>
                    </div>
                    <div className="summary-buttons">
                        <button onClick={handleConfirmDelete} className="button-delete">
                            선택 삭제 ({selectedItemsIds.size})
                        </button>
                        <button onClick={handleConfirmPayment} className="button-purchase">선택 구매 ({selectedItemsIds.size})</button>
                    </div>
                </div>
                </>
            )}
        </div>
    );
}

export default CartPage;