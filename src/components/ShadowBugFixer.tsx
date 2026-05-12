import { useState } from "react";
import { FlatList, View } from "react-native";

export interface ShadowBugFixerProps {
    children: React.ReactNode;
    parentSize?: Size;
}

function ShadowBugFixer(props: ShadowBugFixerProps) {
    const [containerSize, setContainerSize] = useState<Size>({ width: 0, height: 0 });

    return (
        <FlatList
            horizontal
            onLayout={e => setContainerSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
            style={{ flex: 1, width: "100%", height: "100%", overflow: "visible" }}
            data={[1]}
            renderItem={() => (
                <View
                    style={{
                        width: props.parentSize?.width ?? containerSize.width,
                        height: props.parentSize?.height ?? containerSize.height,
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "visible",
                    }}
                >
                    {props.children}
                </View>
            )}
        />
    );
}

export default ShadowBugFixer;
