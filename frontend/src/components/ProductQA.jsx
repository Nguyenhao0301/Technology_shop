import { useState } from "react";
import "./ProductQA.css";

const QUESTIONS = [
  {
    question: "Sản phẩm này còn hàng không?",
    answer:
      "Bạn có thể xem số lượng tồn kho ngay trên trang chi tiết sản phẩm. Nếu sản phẩm hiển thị In Stock thì bạn có thể đặt hàng.",
  },
  {
    question: "Tôi có thể đặt mua nhiều sản phẩm cùng lúc không?",
    answer:
      "Có. Bạn có thể điều chỉnh số lượng sản phẩm trước khi thêm vào giỏ hàng. Số lượng tối đa phụ thuộc vào số lượng tồn kho hiện tại.",
  },
  {
    question: "Thời gian giao hàng bao lâu?",
    answer:
      "Thời gian giao hàng phụ thuộc vào khu vực nhận hàng và đơn vị vận chuyển. Thông tin giao hàng sẽ được cập nhật trong quá trình xử lý đơn hàng.",
  },
  {
    question: "Sản phẩm có được bảo hành không?",
    answer:
      "Chính sách bảo hành phụ thuộc vào từng sản phẩm và thương hiệu. Bạn nên kiểm tra thông tin bảo hành cụ thể của sản phẩm trước khi đặt hàng.",
  },
  {
    question: "Tôi có thể đổi trả sản phẩm không?",
    answer:
      "Sản phẩm có thể được hỗ trợ đổi trả theo chính sách của cửa hàng. Vui lòng liên hệ bộ phận hỗ trợ nếu bạn cần kiểm tra trường hợp cụ thể.",
  },
];

function ProductQA() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex((currentIndex) => (currentIndex === index ? null : index));
  };

  return (
    <section className="product-qa">
      <div className="product-qa-header">
        <h2>FAQ</h2>
        <p>Một số câu hỏi thường gặp về sản phẩm này và đơn hàng của bạn.</p>
      </div>

      <div className="product-qa-list">
        {QUESTIONS.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`product-qa-item ${
                isOpen ? "product-qa-item-open" : ""
              }`}
            >
              <button
                type="button"
                className="product-qa-question"
                onClick={() => handleToggle(index)}
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>

                <span className="product-qa-icon">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="product-qa-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProductQA;
