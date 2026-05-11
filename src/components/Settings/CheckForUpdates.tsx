import { useTranslation } from "@/TranslationContext";
import { checkForUpdates } from "@/Utils";
import Button from "@components/Button";

function CheckForUpdates() {
    const { t } = useTranslation();

    return <Button text={t.settings_check_for_updates} style={{ height: 60 }} onPress={() => checkForUpdates()} />;
}

export default CheckForUpdates;
