/**
 * 全ページ共通フッター。
 * - 非公式の個人制作物である旨を明示し、各区・東京都の公式発信と誤認されないようにする
 * - 外部送信規律に基づくアクセス解析の告知
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer-disclaimer">
        本サイトは非公式であり、東京都および東京23区の各区とは関係ありません。
        キャラクターは制作者が生成AIを用いて制作した創作物です。
        掲載する数値・政策情報は各区および各府省が公開するデータをもとに制作者が加工したもので、
        各区の公式見解を示すものではありません。
      </p>
      <p className="site-footer-note">
        本サイトはサービス改善のため Google Analytics を利用しています。
        診断の回答・結果は個人を特定しない匿名の統計情報として Google に送信されます。
      </p>
    </footer>
  );
}
