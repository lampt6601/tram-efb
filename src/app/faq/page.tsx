import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { FAQAccordion } from "./FAQAccordion";

const faqData = [
  {
    category: "Quy trình mua hàng",
    questions: [
      {
        q: "Làm sao để mua tài khoản?",
        a: "Quy trình mua acc rất đơn giản: 1) Chọn acc mà bạn thích, 2) Nhắn tin cho shop qua Zalo hoặc Facebook, 3) Chốt giá với shop, 4) Thanh toán theo hình thức mà shop đưa ra, 5) Nhận tài khoản trong vòng 5-15 phút sau khi xác nhận thanh toán.",
      },
      {
        q: "Thanh toán bằng cách nào?",
        a: "Shop chấp nhận nhiều hình thức thanh toán để bạn lựa chọn: Chuyển khoản ngân hàng (các ngân hàng nội địa), Momo (ví điện tử), ZaloPay (ví điện tử). Bạn có thể thảo luận với shop để chọn phương thức thanh toán phù hợp nhất.",
      },
      {
        q: "Mua xong bao lâu nhận acc?",
        a: "Sau khi bạn xác nhận thanh toán, shop sẽ gửi tài khoản cho bạn rất nhanh. Thường thì bạn sẽ nhận được acc trong vòng 5-15 phút. Nếu không nhận được trong thời gian này, vui lòng liên hệ ngay với shop qua Zalo để kiểm tra.",
      },
      {
        q: "Có được kiểm tra acc trước khi mua không?",
        a: "Có, bạn hoàn toàn có quyền kiểm tra tài khoản trước khi mua. Shop sẽ gửi video hoặc ảnh chi tiết về acc (chỉ số game, tính năng, hình ảnh các màn hình chính) để bạn xem rõ. Nếu còn câu hỏi về acc nào, đừng ngần ngại nhắn tin cho shop để được tư vấn kỹ lưỡng.",
      },
    ],
  },
  {
    category: "Bảo hành & Hỗ trợ",
    questions: [
      {
        q: "Acc có bảo hành không?",
        a: "Có, tất cả acc bán tại THC eFootball Shop đều có bảo hành login 24 giờ đầu tiên. Điều này nghĩa là nếu bạn không thể đăng nhập được acc trong vòng 24 giờ đầu, shop sẽ hỗ trợ xử lý ngay. Ngoài ra, shop cung cấp hỗ trợ kỹ thuật miễn phí mọi lúc khi bạn cần.",
      },
      {
        q: "Nếu acc bị lỗi sau khi mua thì sao?",
        a: "Nếu acc bị lỗi hoặc gặp vấn đề sau khi mua, bạn cần liên hệ ngay với shop qua Zalo hoặc Facebook. Shop sẽ tiếp nhận thông tin chi tiết về lỗi và sẽ hỗ trợ xử lý ngay lập tức. Các vấn đề phổ biến như lỗi đăng nhập, lỗi kết nối server hay lỗi dữ liệu sẽ được giải quyết trong thời gian ngắn nhất.",
      },
      {
        q: "Shop có uy tín không?",
        a: "Shop THC eFootball hoàn toàn uy tín! Chúng tôi có hơn 160+ giao dịch thành công và nhận được những đánh giá tích cực từ các khách hàng thực sự đã mua hàng. Bạn có thể yên tâm mua sắm tại shop với chất lượng dịch vụ tốt nhất.",
      },
    ],
  },
  {
    category: "Thông tin chung",
    questions: [
      {
        q: "Acc clone là gì?",
        a: "Acc clone là tài khoản được tạo từ dữ liệu backup của một acc gốc. Acc clone có đặc điểm: có cùng đội hình, vật phẩm, và chỉ số như acc gốc, nhưng giá rẻ hơn rất nhiều so với acc chính/gốc. Acc clone được cập nhật dữ liệu định kỳ nên chỉ số có thể thay đổi. Nếu bạn muốn có acc chất lượng với giá tốt, acc clone là lựa chọn hoàn hảo.",
      },
      {
        q: "Server Japan và Other khác nhau thế nào?",
        a: "Server Japan (JP) là server chính chính thức của trò chơi eFootball, được vận hành bởi công ty phát hành game. Server Other bao gồm các server khác như Asia, Global, v.v. Acc trên server Japan thường có chất lượng tốt nhất và được nhiều người chơi ưa chuộng. Tuy nhiên, acc trên các server khác cũng có những ưu điểm riêng.",
      },
      {
        q: "GP, Coins, Lực chiến là gì?",
        a: "Đây là các chỉ số quan trọng trong game eFootball:\n- GP (Gross Price Points): Điểm được dùng để mua cầu thủ trong game, kiếm được từ các trận đấu và nhiệm vụ. GP là tiền tệ chính trong game.\n- Coins: Đồng xu bán được cho khách hàng qua cửa hàng hoặc thành tích. Bạn có thể đổi Coins lấy gói mua cầu thủ.\n- Lực chiến (Team Strength): Chỉ số thể hiện sức mạnh tổng thể của đội hình bạn. Lực chiến cao hơn = đội hình mạnh hơn, bạn sẽ có cơ hội thắng cao hơn trong các trận đấu.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-slate-200 bg-white py-12 sm:py-16 dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">
              Câu Hỏi Thường Gặp
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Tìm câu trả lời cho các câu hỏi phổ biến về mua bán tài khoản
              eFootball tại THC Shop.
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {faqData.map((section, idx) => (
              <div key={idx} className="mb-12 last:mb-0">
                <h2 className="text-lg font-bold text-slate-900 mb-6 dark:text-slate-100">
                  {section.category}
                </h2>
                <div className="space-y-0 border border-slate-200 rounded-lg overflow-hidden dark:border-slate-700">
                  {section.questions.map((item, qIdx) => (
                    <FAQAccordion
                      key={`${idx}-${qIdx}`}
                      question={item.q}
                      answer={item.a}
                      isLast={qIdx === section.questions.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-slate-200 bg-white py-12 sm:py-16 dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-50 border border-indigo-200 p-8 text-center dark:from-indigo-500/10 dark:to-indigo-500/10 dark:border-indigo-500/30">
              <h3 className="text-2xl font-bold text-slate-900 mb-3 dark:text-slate-100">
                Còn câu hỏi khác?
              </h3>
              <p className="text-slate-600 mb-6 dark:text-slate-400">
                Liên hệ với shop qua Zalo hoặc Facebook để được tư vấn trực tiếp
                từ đội ngũ chuyên viên của chúng tôi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/api/contact/owner?type=zalo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
                >
                  Nhắn Zalo
                </a>
                <a
                  href="/api/contact/owner?type=facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
                >
                  Nhắn Facebook
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
